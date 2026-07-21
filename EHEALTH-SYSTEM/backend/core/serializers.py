# Re-export all serializers from apps for backward compatibility
from apps.accounts.serializers import (
    UserSerializer,
    PatientProfileSerializer,
    FamilyMemberProfileSerializer,
    PatientDocumentSerializer,
    RegisterPatientSerializer,
    MedicalHistoryEntrySerializer,
    PublicProfileSerializer,
)

__all__ = [
    'UserSerializer',
    'PatientProfileSerializer',
    'FamilyMemberProfileSerializer',
    'PatientDocumentSerializer',
    'RegisterPatientSerializer',
    'MedicalHistoryEntrySerializer',
    'PublicProfileSerializer',
]
