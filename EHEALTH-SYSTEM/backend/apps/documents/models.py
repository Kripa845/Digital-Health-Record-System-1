from django.db import models
from apps.patients.models import PatientProfile


class PatientDocument(models.Model):
    class Meta:
        app_label = 'core'

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='health_reports/')
    file_size = models.CharField(max_length=50, blank=True)
    file_type = models.CharField(max_length=100, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Doc: {self.title} for {self.patient.healthcare_id}"
