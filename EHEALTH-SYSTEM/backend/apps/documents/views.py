from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.documents.models import PatientDocument
from apps.documents.serializers import PatientDocumentSerializer


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
        from apps.patients.models import PatientProfile
        profile = get_object_or_404(PatientProfile, user=self.request.user)
        family_member_id = self.request.data.get('family_member')

        family_member = None
        if family_member_id and family_member_id not in ('null', ''):
            from apps.family.models import FamilyMemberProfile
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
