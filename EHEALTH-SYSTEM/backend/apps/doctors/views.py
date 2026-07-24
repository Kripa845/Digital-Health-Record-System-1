from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import DoctorProfile
from .serializers import DoctorProfileSerializer


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'ADMIN'


class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'DOCTOR'


class DoctorProfileViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == 'DOCTOR':
            return qs.filter(user=self.request.user)
        return qs

    @action(detail=False, methods=['get'], permission_classes=[IsDoctor])
    def me(self, request):
        profile = DoctorProfile.objects.filter(user=request.user).first()
        if not profile:
            return Response({'detail': 'Doctor profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAdmin])
    def assign_patient(self, request):
        doctor_id = request.data.get('doctor_id')
        patient_id = request.data.get('patient_id')
        if not doctor_id or not patient_id:
            return Response({'detail': 'doctor_id and patient_id are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            doctor = DoctorProfile.objects.get(doctor_id=doctor_id)
            patient = PatientProfile.objects.get(pk=patient_id)
            doctor.assigned_patients.add(patient)
            return Response({'detail': 'Patient assigned successfully.'})
        except DoctorProfile.DoesNotExist:
            return Response({'detail': 'Doctor not found.'}, status=status.HTTP_404_NOT_FOUND)
        except PatientProfile.DoesNotExist:
            return Response({'detail': 'Patient not found.'}, status=status.HTTP_404_NOT_FOUND)
