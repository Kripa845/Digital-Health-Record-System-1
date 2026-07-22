# Re-export all views from apps for backward compatibility
from apps.accounts.views import (
    CustomTokenObtainPairSerializer,
    CustomTokenObtainPairView,
    RegisterPatientView,
    PatientProfileViewSet,
    MedicalHistoryEntryViewSet,
    PatientDocumentViewSet,
    health_check,
    public_profile,
    generate_qr_code,
    get_qr_token,
)
from apps.contact.views import contact_message_create

__all__ = [
    'CustomTokenObtainPairSerializer',
    'CustomTokenObtainPairView',
    'RegisterPatientView',
    'PatientProfileViewSet',
    'MedicalHistoryEntryViewSet',
    'PatientDocumentViewSet',
    'health_check',
    'public_profile',
    'generate_qr_code',
    'get_qr_token',
    'contact_message_create',
]
