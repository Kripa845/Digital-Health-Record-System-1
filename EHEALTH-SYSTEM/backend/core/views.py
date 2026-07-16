from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from django.db.models import Q, F
from django.utils import timezone
import random
import qrcode
from io import BytesIO
import base64
from django.conf import settings

from .models import User, PatientProfile, MedicalHistoryEntry, PatientOTP, FamilyMemberProfile, PatientDocument
from .serializers import (
    RegisterPatientSerializer,
    PatientProfileSerializer,
    MedicalHistoryEntrySerializer,
    FamilyMemberProfileSerializer,
    PatientDocumentSerializer,
)


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
        # Accessible by any authenticated user (admin scanning QR, etc.)
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
# MEDICAL HISTORY VIEWSET  (patient self-reports)
# ─────────────────────────────────────────────
class MedicalHistoryEntryViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalHistoryEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.PATIENT:
            return MedicalHistoryEntry.objects.filter(patient__user=user)
        # Any authenticated user can look up history by healthcare_id (e.g. admin scan)
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
    from django.core.mail import send_mail
    from django.conf import settings

    subject = f"Your E-Health System OTP Code for {purpose.capitalize()}"
    message = (
        f"Hello,\n\n"
        f"Your one-time password (OTP) code is: {otp_code}\n\n"
        f"This code was requested for {purpose} and is valid for 5 minutes.\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"Best regards,\nE-Health System Team"
    )
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@ehealth.com')
    send_mail(subject, message, from_email, [email], fail_silently=False)

    print("\n====================================")
    print(f"[EMAIL SENT] OTP to {email} ({purpose}): {otp_code}")
    print("====================================\n")


# ─────────────────────────────────────────────
# TWO-STEP LOGIN
# ─────────────────────────────────────────────
def send_otp_email(email, otp_code, purpose="login"):
    from django.core.mail import send_mail
    from django.conf import settings
    
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
    # We still print to console so it's super easy to debug locally

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

    if user and user.check_password(password):
        email_to_send = user.email
        if not email_to_send and '@' in username:
            email_to_send = username
            user.email = email_to_send
            user.save()

        if not email_to_send:
            return Response(
                {"detail": "No email address found for this account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp_code = str(random.randint(100000, 999999))
        PatientOTP.objects.create(user=user, otp_code=otp_code)
        # try:
        #     send_otp_email(email_to_send, otp_code, purpose="login")
        # except Exception as e:
        #     # Email is optional (the OTP is also shown in the UI), so never
        #     # let a mail failure block login.
        #     print(f"[EMAIL ERROR] OTP email failed: {e}")
        print(f"[DEV] OTP for {email_to_send}: {otp_code}")

        return Response({
            "status": "OTP_SENT",
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "mobile_number": user.mobile_number,
               # dev-only; remove in production
        }, status=status.HTTP_200_OK)

    return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)


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
    otp = PatientOTP.objects.filter(user=user, is_used=False).order_by('-created_at').first()

    if otp and otp.otp_code == otp_code:
        if otp.is_expired:
            return Response({"detail": "OTP code has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)
        otp.is_used = True
        otp.save()

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

    return Response({"detail": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────
# FORGOT / RESET PASSWORD
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_reset_otp(request):
    user_id = request.data.get("user_id")
    otp_code = request.data.get("otp_code")

    if not user_id or not otp_code:
        return Response(
            {"detail": "User ID and OTP are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = get_object_or_404(User, id=user_id)
    otp = PatientOTP.objects.filter(user=user, is_used=False).order_by("-created_at").first()

    if not otp:
        return Response({"detail": "OTP not found."}, status=status.HTTP_400_BAD_REQUEST)
    if otp.is_expired:
        return Response({"detail": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
    if otp.otp_code != otp_code:
        return Response({"detail": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"verified": True, "message": "OTP verified successfully."}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    # The forgot-password screen only collects the user's email; the OTP is
    # emailed, so we look the account up by email and only send the OTP when
    # it matches a registered account.
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
    PatientOTP.objects.create(user=user, otp_code=otp_code)
    # try:
    #     send_otp_email(email_to_send, otp_code, purpose="password reset")
    # except Exception as e:
    #     print(f"[EMAIL ERROR] Reset OTP email failed: {e}")
    print(f"[DEV] Password reset OTP for {email_to_send}: {otp_code}")
    return Response({
        "status": "OTP_SENT",
        "user_id": user.id,
        "email": user.email,
        "mobile_number": user.mobile_number,
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
    otp = PatientOTP.objects.filter(
        user=user, otp_code=otp_code, is_used=False
    ).order_by("-created_at").first()

    if not otp:
        return Response({"detail": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
    if otp.is_expired:
        return Response({"detail": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    otp.is_used = True
    otp.save()

    return Response({"detail": "Password reset successfully."}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# PUBLIC HEALTH CHECK  (no auth required)
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({"status": "ok"}, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────
# PUBLIC QR SCAN VIEW  (no auth required)
# ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_profile(request, token):
    now = timezone.now()

    # Try Patient Profile first
    profile = PatientProfile.objects.filter(qr_token=token).first()
    if profile:
        PatientProfile.objects.filter(pk=profile.pk).update(
            scan_count=F('scan_count') + 1,
            last_scanned_at=now,
        )
        profile.refresh_from_db()
        docs = PatientDocument.objects.filter(patient=profile, family_member__isnull=True)
        family = FamilyMemberProfile.objects.filter(patient=profile)
        return Response({
            "type": "PATIENT",
            "profile": PatientProfileSerializer(profile).data,
            "documents": PatientDocumentSerializer(docs, many=True, context={'request': request}).data,
            "family_members": FamilyMemberProfileSerializer(family, many=True).data,
        }, status=status.HTTP_200_OK)

    # Try Family Member Profile
    family_member = FamilyMemberProfile.objects.filter(qr_token=token).first()
    if family_member:
        FamilyMemberProfile.objects.filter(pk=family_member.pk).update(
            scan_count=F('scan_count') + 1,
            last_scanned_at=now,
        )
        family_member.refresh_from_db()
        docs = PatientDocument.objects.filter(family_member=family_member)
        return Response({
            "type": "FAMILY_MEMBER",
            "profile": FamilyMemberProfileSerializer(family_member).data,
            "documents": PatientDocumentSerializer(docs, many=True, context={'request': request}).data,
        }, status=status.HTTP_200_OK)

    return Response(
        {"detail": "Invalid QR Token or profile not found."},
        status=status.HTTP_404_NOT_FOUND,
    )


# ─────────────────────────────────────────────
# FAMILY MEMBER VIEWSET
# ─────────────────────────────────────────────
class FamilyMemberProfileViewSet(viewsets.ModelViewSet):
    serializer_class = FamilyMemberProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FamilyMemberProfile.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        profile = get_object_or_404(PatientProfile, user=self.request.user)
        serializer.save(patient=profile)


# ─────────────────────────────────────────────
# DOCUMENT VIEWSET
# ─────────────────────────────────────────────
class PatientDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = PatientDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = PatientDocument.objects.filter(patient__user=self.request.user)
        family_member_id = self.request.query_params.get('family_member_id')
        if family_member_id:
            if family_member_id == 'main':
                qs = qs.filter(family_member__isnull=True)
            else:
                qs = qs.filter(family_member_id=family_member_id)
        return qs

    def perform_create(self, serializer):
        profile = get_object_or_404(PatientProfile, user=self.request.user)
        family_member_id = self.request.data.get('family_member')

        family_member = None
        if family_member_id and family_member_id not in ('null', ''):
            family_member = get_object_or_404(
                FamilyMemberProfile, id=family_member_id, patient=profile
            )

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
            family_member=family_member,
            file_size=file_size,
            file_type=file_type,
        )


# //////////////////////
# ─────────────────────────────────────────────
# QR CODE GENERATION
# ─────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_qr_code(request):
    """
    Generate QR code for a patient or family member
    POST /api/generate-qr/
    Body: {"profile_type": "patient", "profile_id": 123}  # or {"profile_type": "family", "profile_id": 456}
    """
    try:
        profile_type = request.data.get('profile_type', 'patient')
        profile_id = request.data.get('profile_id')
        
        # If no profile_id provided, use the current user's patient profile
        if not profile_id and request.user.role == User.Role.PATIENT:
            profile = get_object_or_404(PatientProfile, user=request.user)
            profile_id = profile.id
            profile_type = 'patient'
        
        if not profile_id:
            return Response(
                {'error': 'profile_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the profile and its QR token
        qr_token = None
        profile_data = None
        
        if profile_type == 'patient':
            profile = get_object_or_404(PatientProfile, id=profile_id)
            # Check if user has access (owner or admin)
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
            
        elif profile_type == 'family':
            family_member = get_object_or_404(FamilyMemberProfile, id=profile_id)
            # Check if user has access (owner or admin)
            if request.user.role != User.Role.ADMIN and family_member.patient.user != request.user:
                return Response(
                    {'error': 'You do not have permission to generate QR for this profile'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            qr_token = family_member.qr_token
            profile_data = {
                'type': 'FAMILY_MEMBER',
                'id': family_member.id,
                'name': family_member.full_name,
                'relationship': family_member.relationship
            }
        else:
            return Response(
                {'error': 'Invalid profile_type. Use "patient" or "family"'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not qr_token:
            return Response(
                {'error': 'QR token not found for this profile'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate QR URL
        # Get frontend URL from settings or use default
        frontend_url = getattr(settings, 'FRONTEND_URL', 'https://digital-health-record-system-3.onrender.com')
        
        # The QR code will point to your frontend with the token
        # Your frontend should have a route like /scan/{token}
        qr_data = f"{frontend_url}/scan/{qr_token}"
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Generate image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return Response({
            'success': True,
            'data': {
                'qr_code': img_str,  # Base64 encoded image
                'url': qr_data,      # The actual URL
                'token': qr_token,   # The QR token
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
    """
    Get QR token for a profile without generating the image
    GET /api/qr-token/{profile_type}/{profile_id}/
    """
    try:
        if profile_type == 'patient':
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
            
        elif profile_type == 'family':
            family_member = get_object_or_404(FamilyMemberProfile, id=profile_id)
            if request.user.role != User.Role.ADMIN and family_member.patient.user != request.user:
                return Response(
                    {'error': 'Permission denied'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            qr_token = family_member.qr_token
            profile_data = {
                'type': 'FAMILY_MEMBER',
                'id': family_member.id,
                'name': family_member.full_name,
                'relationship': family_member.relationship
            }
        else:
            return Response(
                {'error': 'Invalid profile_type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
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