from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.family.models import FamilyMemberProfile,PatientProfile
from apps.family.serializers import FamilyMemberProfileSerializer


class FamilyMemberProfileViewSet(viewsets.ModelViewSet):
    serializer_class = FamilyMemberProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FamilyMemberProfile.objects.filter(patient__user=self.request.user)

    def perform_create(self, serializer):
        profile = get_object_or_404(PatientProfile, user=self.request.user)
        serializer.save(patient=profile)
