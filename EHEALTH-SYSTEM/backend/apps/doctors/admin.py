from django.contrib import admin
<<<<<<< HEAD
from django.utils.html import format_html
from .models import DoctorProfile


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = (
        'doctor_id',
        'full_name',
        'department',
        'specialization',
        'phone_number',
        'status',
        'registration_date',
    )
    list_filter = (
        'department',
        'specialization',
        'status',
        'registration_date',
    )
    search_fields = (
        'doctor_id',
        'first_name',
        'last_name',
        'phone_number',
        'medical_license_number',
        'user__username',
    )
    ordering = ('-registration_date',)
    list_per_page = 25
    date_hierarchy = 'registration_date'
    autocomplete_fields = ['user', 'created_by', 'assigned_patients']

    readonly_fields = ('doctor_id', 'age', 'registration_date')

    fieldsets = (
        (None, {
            'fields': ('user', 'doctor_id', 'status'),
        }),
        ('Personal Information', {
            'fields': (
                'first_name',
                'middle_name',
                'last_name',
                'gender',
                'date_of_birth',
                'age',
                'phone_number',
                'photo',
            ),
        }),
        ('Professional Information', {
            'fields': (
                'department',
                'specialization',
                'medical_license_number',
                'availability',
            ),
        }),
        ('Assignment', {
            'fields': ('assigned_patients',),
        }),
        ('Metadata', {
            'fields': ('registration_date', 'created_by'),
            'classes': ('collapse',),
        }),
    )

    def full_name(self, obj):
        return f"Dr. {obj.first_name} {obj.last_name}"
    full_name.short_description = "Full Name"
    full_name.admin_order_field = 'first_name'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'created_by').prefetch_related('assigned_patients')
=======
from apps.doctors.models import DoctorProfile

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ['doctor_id', 'first_name', 'last_name', 'specialization', 'department', 'status', 'phone_number']
    search_fields = ['doctor_id', 'first_name', 'last_name', 'specialization', 'phone_number']
    list_filter = ['status', 'department', 'specialization']
    readonly_fields = ['doctor_id', 'registration_date']
>>>>>>> c47456f7800640b06be9d45b184323eeaa77dee9
