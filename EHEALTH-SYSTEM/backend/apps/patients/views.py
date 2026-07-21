from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.patients.models import PatientProfile
from apps.patients.serializers import PatientProfileSerializer


class PatientProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        if request.user.role != 'PATIENT':
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
