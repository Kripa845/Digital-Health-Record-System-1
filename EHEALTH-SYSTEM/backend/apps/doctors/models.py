import uuid
<<<<<<< HEAD
import random
import string
from datetime import datetime
from django.db import models
from django.conf import settings
from apps.patients.models import PatientProfile
=======
from django.db import models
from django.conf import settings
>>>>>>> c47456f7800640b06be9d45b184323eeaa77dee9


class DoctorProfile(models.Model):
    class Meta:
        app_label = 'core'
<<<<<<< HEAD

    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    doctor_id = models.CharField(max_length=20, unique=True, editable=False)
    first_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    age = models.IntegerField(editable=False, null=True, blank=True)
    phone_number = models.CharField(max_length=20, unique=True)
    photo = models.ImageField(upload_to='doctor_photos/', blank=True, null=True)
    department = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)
    medical_license_number = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    registration_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_doctors')
    assigned_patients = models.ManyToManyField(PatientProfile, related_name='assigned_doctors', blank=True)
    availability = models.TextField(blank=True, help_text='e.g., Mon-Fri 9:00-17:00')

    def save(self, *args, **kwargs):
        if not self.doctor_id:
            year = datetime.now().year
            rand_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            self.doctor_id = f"DOC-{year}-{rand_str}"
        if self.date_of_birth:
            today = datetime.now().date()
            dob = self.date_of_birth
            self.age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
=======
        ordering = ['-registration_date']

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    doctor_id = models.CharField(max_length=20, unique=True, editable=False)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, unique=True)
    photo = models.ImageField(upload_to='doctors/photos/', blank=True, null=True)
    department = models.CharField(max_length=100, blank=True)
    specialization = models.CharField(max_length=100, blank=True)
    medical_license_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, default='Active')
    registration_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_doctors')
    patients = models.ManyToManyField(to='core.PatientProfile', blank=True, related_name='assigned_doctors')

    def save(self, *args, **kwargs):
        if not self.doctor_id:
            self.doctor_id = f"DOC-{uuid.uuid4().hex[:8].upper()}"
>>>>>>> c47456f7800640b06be9d45b184323eeaa77dee9
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name} ({self.doctor_id})"
