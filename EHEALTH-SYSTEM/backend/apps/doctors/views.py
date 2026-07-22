from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from apps.accounts.models import User
from apps.doctors.models import DoctorProfile
from apps.doctors.serializers import DoctorProfileSerializer, AssignedPatientSerializer
from apps.patients.models import PatientProfile

User = get_user_model()


class DoctorProfileViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.ADMIN:
            return DoctorProfile.objects.all()
        if user.role == User.Role.DOCTOR:
            return DoctorProfile.objects.filter(user=user)
        return DoctorProfile.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        if request.user.role != User.Role.DOCTOR:
            return Response(
                {"detail": "Only doctors have doctor profiles."},
                status=status.HTTP_403_FORBIDDEN,
            )
        profile = get_object_or_404(DoctorProfile, user=request.user)
        return Response(DoctorProfileSerializer(profile).data)

    @action(detail=True, methods=['post'], url_path='assign-patient')
    def assign_patient(self, request, pk=None):
        if request.user.role != User.Role.ADMIN:
            return Response(
                {"detail": "Only admins can assign patients to doctors."},
                status=status.HTTP_403_FORBIDDEN,
            )
        doctor = self.get_object()
        patient_id = request.data.get('patient_id')
        if not patient_id:
            return Response(
                {"detail": "patient_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        patient = PatientProfile.objects.filter(id=patient_id).first()
        if not patient:
            user = User.objects.filter(id=patient_id, role=User.Role.PATIENT).first()
            if user:
                patient = getattr(user, 'patient_profile', None)
        if not patient:
            return Response(
                {"detail": "Patient not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        doctor.patients.add(patient)
        return Response(
            {"detail": "Patient assigned successfully.", "doctor_id": doctor.doctor_id, "patient_id": patient.id},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'], url_path='my-patients')
    def my_patients(self, request):
        if request.user.role != User.Role.DOCTOR:
            return Response(
                {"detail": "Only doctors can view their patients."},
                status=status.HTTP_403_FORBIDDEN,
            )
        doctor = get_object_or_404(DoctorProfile, user=request.user)
        patients = doctor.patients.select_related('user').all()
        serializer = AssignedPatientSerializer(patients, many=True)
        return Response(
            {"doctor_id": doctor.doctor_id, "patients": serializer.data},
            status=status.HTTP_200_OK,
        )
