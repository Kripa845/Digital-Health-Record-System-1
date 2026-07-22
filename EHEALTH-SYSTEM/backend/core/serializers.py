# Re-export all serializers from apps for backward compatibility
from apps.accounts.serializers import (
    UserSerializer,
    PatientProfileSerializer,
    PatientDocumentSerializer,
    RegisterPatientSerializer,
    MedicalHistoryEntrySerializer,
    PublicProfileSerializer,
)

__all__ = [
    'UserSerializer',
    'PatientProfileSerializer',
    'PatientDocumentSerializer',
    'RegisterPatientSerializer',
    'MedicalHistoryEntrySerializer',
    'PublicProfileSerializer',
]
