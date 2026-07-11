from django.contrib import admin
from .models import User, PatientProfile, FamilyMemberProfile, PatientDocument, MedicalHistoryEntry, PatientOTP

admin.site.register(User)
admin.site.register(PatientProfile)
admin.site.register(FamilyMemberProfile)
admin.site.register(PatientDocument)
admin.site.register(MedicalHistoryEntry)
admin.site.register(PatientOTP)
