import uuid
from django.db import models
from django.conf import settings


class DoctorProfile(models.Model):
    class Meta:
        app_label = 'core'
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
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name} ({self.doctor_id})"
