from django.db import models
from apps.patients.models import PatientProfile
from apps.family.models import FamilyMemberProfile


class PatientDocument(models.Model):
    class Meta:
        app_label = 'core'

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='documents')
    family_member = models.ForeignKey(
        FamilyMemberProfile, on_delete=models.CASCADE,
        related_name='documents', null=True, blank=True
    )
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='health_reports/')
    file_size = models.CharField(max_length=50, blank=True)
    file_type = models.CharField(max_length=100, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        owner = f"{self.family_member.first_name} (Family)" if self.family_member else "Main"
        return f"Doc: {self.title} for {self.patient.healthcare_id} ({owner})"
