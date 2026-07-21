import random
import string
import uuid
from datetime import datetime
from django.db import models
from django.conf import settings


class PatientProfile(models.Model):
    class Meta:
        app_label = 'core'

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patient_profile')
    healthcare_id = models.CharField(max_length=20, unique=True, editable=False)
    health_insurance_id = models.CharField(max_length=50, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    blood_type = models.CharField(max_length=10, blank=True)
    contact_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    age = models.IntegerField(null=True, blank=True)
    blood_group = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    major_allergies = models.TextField(blank=True)
    height = models.CharField(max_length=20, blank=True)
    weight = models.CharField(max_length=20, blank=True)
    active_prescription = models.TextField(blank=True)
    current_medication = models.TextField(blank=True)
    recent_pain = models.TextField(blank=True)
    is_profile_setup = models.BooleanField(default=False)
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    scan_count = models.PositiveIntegerField(default=0)
    last_scanned_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.healthcare_id:
            year = datetime.now().year
            rand_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
            self.healthcare_id = f"EH-{year}-{rand_str}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.healthcare_id})"
