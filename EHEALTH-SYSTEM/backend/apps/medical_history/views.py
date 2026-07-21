from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied

from apps.medical_history.models import MedicalHistoryEntry
from apps.medical_history.serializers import MedicalHistoryEntrySerializer
from apps.accounts.models import User


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
        from apps.patients.models import PatientProfile
        profile = get_object_or_404(PatientProfile, user=self.request.user)
        serializer.save(patient=profile)
