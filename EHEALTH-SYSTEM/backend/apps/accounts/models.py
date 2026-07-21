from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Meta:
        app_label = 'core'
        verbose_name = "User"
        verbose_name_plural = "Users"

    class Role(models.TextChoices):
        PATIENT = 'PATIENT', 'Patient'
        ADMIN = 'ADMIN', 'Admin/Institution'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.PATIENT)
    email = models.EmailField(blank=True, null=True)
    mobile_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
