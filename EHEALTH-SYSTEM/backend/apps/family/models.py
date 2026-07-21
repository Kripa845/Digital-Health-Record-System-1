import uuid
from datetime import datetime
from django.db import models
from apps.patients.models import PatientProfile


class FamilyMemberProfile(models.Model):
    class Meta:
        app_label = 'core'

    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='family_members')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    blood_group = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    major_allergies = models.TextField(blank=True)
    height = models.CharField(max_length=20, blank=True)
    weight = models.CharField(max_length=20, blank=True)
    active_prescription = models.TextField(blank=True)
    current_medication = models.TextField(blank=True)
    recent_pain = models.TextField(blank=True)
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    scan_count = models.PositiveIntegerField(default=0)
    last_scanned_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.relationship} of {self.patient.healthcare_id})"
