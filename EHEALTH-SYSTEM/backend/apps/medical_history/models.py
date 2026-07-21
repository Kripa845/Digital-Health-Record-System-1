from django.db import models
from apps.patients.models import PatientProfile


class MedicalHistoryEntry(models.Model):
    class Meta:
        app_label = 'core'

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='history_entries')
    title = models.CharField(max_length=150)
    description = models.TextField()
    category = models.CharField(max_length=50, default='General')
    date_recorded = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} for {self.patient.healthcare_id}"
