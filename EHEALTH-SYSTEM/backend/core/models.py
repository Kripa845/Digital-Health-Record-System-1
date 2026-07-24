# Core app — backward compatibility layer
# Actual model code lives in apps/ but Django still sees them as core models
# to preserve existing database table names and migrations.

from apps.accounts.models import User
from apps.patients.models import PatientProfile
from apps.medical_history.models import MedicalHistoryEntry
from apps.documents.models import PatientDocument
from apps.contact.models import ContactMessage

__all__ = [
    'User',
    'PatientProfile',
    'MedicalHistoryEntry',
    'PatientDocument',
    'ContactMessage',
]
