from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from django.db.models import Q, F
from django.utils import timezone
from rest_framework.views import APIView
import random
import qrcode
from io import BytesIO
import base64
from django.conf import settings

from apps.accounts.models import User
from apps.patients.models import PatientProfile
from apps.medical_history.models import MedicalHistoryEntry
from apps.documents.models import PatientDocument
from apps.patients.serializers import PatientProfileSerializer
from apps.medical_history.serializers import MedicalHistoryEntrySerializer
from apps.documents.serializers import PatientDocumentSerializer
from apps.accounts.serializers import RegisterPatientSerializer, PublicProfileSerializer


# ─────────────────────────────────────────────
# CUSTOM JWT — embeds role + user data in token
# ─────────────────────────────────────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
        }
        if self.user.role == User.Role.PATIENT:
            profile = getattr(self.user, 'patient_profile', None)
            if profile:
                data['user']['healthcare_id'] = profile.healthcare_id
                data['user']['profile_id'] = profile.id
        elif self.user.role == User.Role.DOCTOR:
            profile = getattr(self.user, 'doctor_profile', None)
            if profile:
                data['user']['doctor_id'] = profile.doctor_id
                data['user']['profile_id'] = profile.id
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


# ─────────────────────────────────────────────
# REGISTRATION
# ─────────────────────────────────────────────
class RegisterPatientView(generics.CreateAPIView):
    serializer_class = RegisterPatientSerializer
    permission_classes = [permissions.AllowAny]


# ─────────────────────────────────────────────
# PATIENT PROFILE VIEWSET
# ─────────────────────────────────────────────
class PatientProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        if request.user.role != User.Role.PATIENT:
            return Response(
                {"detail": "Only patients have personal profiles."},
                status=status.HTTP_403_FORBIDDEN,
            )
        profile, _ = PatientProfile.objects.get_or_create(user=request.user)
        if request.method == 'GET':
            return Response(PatientProfileSerializer(profile).data)
        serializer = PatientProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-healthcare-id/(?P<healthcare_id>[^/.]+)')
    def by_healthcare_id(self, request, healthcare_id=None):
        profile = get_object_or_404(PatientProfile, healthcare_id=healthcare_id)
        return Response(PatientProfileSerializer(profile).data)

    @action(detail=False, methods=['post'], url_path='delete-me')
    def delete_me(self, request):
        password = request.data.get('password')
        if not password:
            return Response(
                {"detail": "Password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = request.user
        if not user.check_password(password):
            return Response(
                {"detail": "Incorrect password. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.delete()
        return Response({"detail": "Account deleted successfully."}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# MEDICAL HISTORY VIEWSET
# ─────────────────────────────────────────────
class MedicalHistoryEntryViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalHistoryEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.PATIENT:
            return MedicalHistoryEntry.objects.filter(patient__user=user)
        healthcare_id = self.request.query_params.get('healthcare_id')
        if healthcare_id:
            return MedicalHistoryEntry.objects.filter(patient__healthcare_id=healthcare_id)
        return MedicalHistoryEntry.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != User.Role.PATIENT:
            raise PermissionDenied("Only patients can add to their medical history.")
        profile = get_object_or_404(PatientProfile, user=self.request.user)
        serializer.save(patient=profile)


# ─────────────────────────────────────────────
# OTP EMAIL HELPER
# ─────────────────────────────────────────────
def send_otp_email(email, otp_code, purpose="login"):
    from django.conf import settings
    from django.core.mail import send_mail

    subject = f"Your E-Health System OTP Code for {purpose.capitalize()}"
    message = (
        f"Hello,\n\n"
        f"Your one-time password (OTP) code is: {otp_code}\n\n"
        f"This code was requested for {purpose} and is valid for 5 minutes.\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"Best regards,\n"
        f"E-Health System Team"
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@ehealth.com')

    try:
        send_mail(
            subject,
            message,
            from_email,
            [email],
            fail_silently=False,
        )
        print("===================================")
        print("EMAIL SENT SUCCESSFULLY")
        print("To:", email)
        print("OTP:", otp_code)
        print("===================================")
    except BaseException as e:
        print(f"[EMAIL ERROR] All email methods failed: {type(e).__name__}: {e}")


# ─────────────────────────────────────────────
# TWO-STEP LOGIN
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_init(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"detail": "Username/mobile number and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(
        Q(username=username) | Q(mobile_number=username) | Q(email=username)
    ).first()

    if not user or not user.check_password(password):
        return Response(
            {"detail": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    email_to_send = user.email

    if not email_to_send and '@' in username:
        email_to_send = username
        user.email = email_to_send
        user.save()

    if not email_to_send:
        return Response(
            {"detail": "No email address found."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp_code = str(random.randint(100000, 999999))

    try:
        send_otp_email(email_to_send, otp_code, purpose="login")
    except BaseException as e:
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")

    return Response({
        "status": "OTP_SENT",
        "user_id": user.id,
        "email": user.email,
        "simulated_otp": otp_code,
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_verify(request):
    user_id = request.data.get('user_id')
    otp_code = request.data.get('otp_code')

    if not user_id or not otp_code:
        return Response(
            {"detail": "User ID and OTP code are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = get_object_or_404(User, id=user_id)

    refresh = RefreshToken.for_user(user)
    refresh['role'] = user.role
    refresh['username'] = user.username

    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role,
        'first_name': user.first_name,
        'last_name': user.last_name,
    }

    if user.role == User.Role.PATIENT:
        profile, _ = PatientProfile.objects.get_or_create(user=user)
        user_data['healthcare_id'] = profile.healthcare_id
        user_data['profile_id'] = profile.id
        user_data['is_profile_setup'] = profile.is_profile_setup

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': user_data,
    }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# FORGOT / RESET PASSWORD
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_reset_otp(request):
    return Response(
        {"verified": True, "message": "OTP verified successfully."},
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    if not email:
        return Response(
            {"detail": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(
        Q(username=email) | Q(mobile_number=email) | Q(email=email)
    ).first()

    if not user:
        return Response(
            {"detail": "No account found with that email address."},
            status=status.HTTP_404_NOT_FOUND,
        )

    email_to_send = user.email or email
    if not email_to_send:
        return Response(
            {"detail": "No email address found for this account to send recovery OTP."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    otp_code = str(random.randint(100000, 999999))

    try:
        send_otp_email(email_to_send, otp_code, purpose="password reset")
    except BaseException as e:
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")

    return Response({
        "status": "OTP_SENT",
        "user_id": user.id,
        "email": user.email,
        "mobile_number": user.mobile_number,
        "simulated_otp": otp_code,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password(request):
    user_id = request.data.get("user_id")
    otp_code = request.data.get("otp_code")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not all([user_id, otp_code, new_password, confirm_password]):
        return Response({"detail": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({"detail": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

    user = get_object_or_404(User, id=user_id)
    user.set_password(new_password)
    user.save()

    return Response({"detail": "Password reset successfully."}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# PUBLIC HEALTH CHECK
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# PUBLIC QR SCAN VIEW
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_profile(request, token):
    now = timezone.now()

    profile = PatientProfile.objects.filter(qr_token=token).first()
    if profile:
        PatientProfile.objects.filter(pk=profile.pk).update(
            scan_count=F('scan_count') + 1,
            last_scanned_at=now,
        )
        profile.refresh_from_db()
        docs = PatientDocument.objects.filter(patient=profile)
        return Response({
            "type": "PATIENT",
            "profile": PatientProfileSerializer(profile).data,
            "documents": PatientDocumentSerializer(docs, many=True, context={'request': request}).data,
        }, status=status.HTTP_200_OK)

    return Response(
        {"detail": "Invalid QR Token or profile not found."},
        status=status.HTTP_404_NOT_FOUND,
    )


# ─────────────────────────────────────────────
# DOCUMENT VIEWSET
# ─────────────────────────────────────────────
class PatientDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = PatientDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PatientDocument.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        profile = get_object_or_404(PatientProfile, user=self.request.user)
        uploaded_file = self.request.FILES.get('file')
        file_size = ""
        file_type = ""
        if uploaded_file:
            size_bytes = uploaded_file.size
            if size_bytes < 1024 * 1024:
                file_size = f"{round(size_bytes / 1024, 1)} KB"
            else:
                file_size = f"{round(size_bytes / (1024 * 1024), 1)} MB"
            file_type = uploaded_file.content_type

        serializer.save(
            patient=profile,
            file_size=file_size,
            file_type=file_type,
        )


# ─────────────────────────────────────────────
# QR CODE GENERATION
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_qr_code(request):
    try:
        profile_id = request.data.get('profile_id')
        
        if not profile_id and request.user.role == User.Role.PATIENT:
            profile = get_object_or_404(PatientProfile, user=request.user)
            profile_id = profile.id
        
        if not profile_id:
            return Response(
                {'error': 'profile_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile = get_object_or_404(PatientProfile, id=profile_id)
        if request.user.role != User.Role.ADMIN and profile.user != request.user:
            return Response(
                {'error': 'You do not have permission to generate QR for this profile'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        qr_token = profile.qr_token
        profile_data = {
            'type': 'PATIENT',
            'id': profile.id,
            'name': f"{profile.user.first_name} {profile.user.last_name}",
            'healthcare_id': profile.healthcare_id
        }
        
        if not qr_token:
            return Response(
                {'error': 'QR token not found for this profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://digital-health-record-system-3.onrender.com')
        qr_data = f"{frontend_url}/shared-profile/{qr_token}"
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return Response({
            'success': True,
            'data': {
                'qr_code': img_str,
                'url': qr_data,
                'token': qr_token,
                'profile': profile_data
            }
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_qr_token(request, profile_type, profile_id):
    try:
        if profile_type != 'patient':
            return Response(
                {'error': 'Invalid profile_type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile = get_object_or_404(PatientProfile, id=profile_id)
        if request.user.role != User.Role.ADMIN and profile.user != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        qr_token = profile.qr_token
        profile_data = {
            'type': 'PATIENT',
            'id': profile.id,
            'name': f"{profile.user.first_name} {profile.user.last_name}",
            'healthcare_id': profile.healthcare_id
        }
        
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://digital-health-record-system-3.onrender.com')
        
        return Response({
            'success': True,
            'data': {
                'token': qr_token,
                'url': f"{frontend_url}/scan/{qr_token}",
                'profile': profile_data
            }
        })
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.ADMIN:
            return Response(
                {"detail": "Only admins can access dashboard stats."},
                status=status.HTTP_403_FORBIDDEN,
            )
        total_users = User.objects.count()
        total_patients = User.objects.filter(role=User.Role.PATIENT).count()
        total_admins = User.objects.filter(role=User.Role.ADMIN).count()
        total_doctors = User.objects.filter(role=User.Role.DOCTOR).count()
        active_users = User.objects.filter(is_active=True).count()
        return Response({
            "total_users": total_users,
            "total_patients": total_patients,
            "total_admins": total_admins,
            "total_doctors": total_doctors,
            "active_users": active_users,
        })
