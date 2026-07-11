from rest_framework import permissions
from .models import User

class IsPatient(permissions.BasePermission):
    """
    Allows access only to users registered as Patients.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == User.Role.PATIENT

class IsInstitution(permissions.BasePermission):
    """
    Allows access only to users registered as Admin/Institutions.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == User.Role.ADMIN
