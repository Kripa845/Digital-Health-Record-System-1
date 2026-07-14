from django.db import models
from django.contrib.auth.models import AbstractUser
import random
import string
import uuid
from datetime import datetime


class User(AbstractUser):
    class Role(models.TextChoices):
        PATIENT = 'PATIENT', 'Patient'
        ADMIN = 'ADMIN', 'Admin/Institution'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.PATIENT)
    email = models.EmailField(blank=True, null=True)
    mobile_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    healthcare_id = models.CharField(max_length=20, unique=True, editable=False)
    health_insurance_id = models.CharField(max_length=50, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    blood_type = models.CharField(max_length=10, blank=True)
    contact_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    # Mero Care Card fields
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


class FamilyMemberProfile(models.Model):
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


class PatientDocument(models.Model):
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


class MedicalHistoryEntry(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='history_entries')
    title = models.CharField(max_length=150)
    description = models.TextField()
    category = models.CharField(max_length=50, default='General')
    date_recorded = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} for {self.patient.healthcare_id}"


class PatientOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    @property
    def is_expired(self):
        from django.utils import timezone
        from datetime import timedelta
        return timezone.now() > self.created_at + timedelta(minutes=5)

    def __str__(self):
        return f"OTP {self.otp_code} for {self.user.username}"
