from django.contrib import admin
from apps.doctors.models import DoctorProfile

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ['doctor_id', 'first_name', 'last_name', 'specialization', 'department', 'status', 'phone_number']
    search_fields = ['doctor_id', 'first_name', 'last_name', 'specialization', 'phone_number']
    list_filter = ['status', 'department', 'specialization']
    readonly_fields = ['doctor_id', 'registration_date']
