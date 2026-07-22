import csv
import datetime
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.db.models import Count, Sum, Q, F, Case, When, IntegerField, Value
from django.http import HttpResponse
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from django.template.response import TemplateResponse
from django.contrib import messages

from .models import User, PatientProfile, FamilyMemberProfile, PatientDocument, MedicalHistoryEntry, PatientOTP, ContactMessage


# ──────────────────────────────────────────────────────────────────────────────
# Inline Models
# ──────────────────────────────────────────────────────────────────────────────

class FamilyMemberProfileInline(admin.TabularInline):
    model = FamilyMemberProfile
    extra = 0
    fields = (
        'full_name',
        'relationship',
        'gender',
        'blood_group',
        'age',
        'emergency_contact',
        'qr_token',
        'scan_count',
        'last_scanned_at',
    )
    readonly_fields = ('qr_token', 'scan_count', 'last_scanned_at')
    verbose_name = "Family Member"
    verbose_name_plural = "Family Members"
    show_change_link = True


class PatientDocumentInline(admin.TabularInline):
    model = PatientDocument
    extra = 0
    fields = (
        'title',
        'file',
        'file_type',
        'file_size',
        'family_member',
        'uploaded_at',
    )
    readonly_fields = ('file_size', 'file_type', 'uploaded_at')
    verbose_name = "Document"
    verbose_name_plural = "Documents"
    show_change_link = True


class MedicalHistoryEntryInline(admin.TabularInline):
    model = MedicalHistoryEntry
    extra = 0
    fields = (
        'title',
        'category',
        'description',
        'date_recorded',
    )
    readonly_fields = ('date_recorded',)
    verbose_name = "Medical Record"
    verbose_name_plural = "Medical History"
    show_change_link = True


# ──────────────────────────────────────────────────────────────────────────────
# Admin Actions
# ──────────────────────────────────────────────────────────────────────────────

def export_as_csv(model_admin, request, queryset):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{model_admin.model._meta.verbose_name_plural}_{timezone.now().strftime("%Y%m%d_%H%M%S")}.csv"'
    writer = csv.writer(response)

    fields = [field.verbose_name for field in model_admin.model._meta.fields]
    writer.writerow(fields)

    for obj in queryset:
        row = []
        for field in model_admin.model._meta.fields:
            value = getattr(obj, field.name)
            if value is None:
                value = ""
            row.append(str(value))
        writer.writerow(row)

    return response

export_as_csv.short_description = "Export selected to CSV"


def export_as_excel(model_admin, request, queryset):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{model_admin.model._meta.verbose_name_plural}_{timezone.now().strftime("%Y%m%d_%H%M%S")}.xls"'
    writer = csv.writer(response, delimiter='\t')

    fields = [field.verbose_name for field in model_admin.model._meta.fields]
    writer.writerow(fields)

    for obj in queryset:
        row = []
        for field in model_admin.model._meta.fields:
            value = getattr(obj, field.name)
            if value is None:
                value = ""
            row.append(str(value))
        writer.writerow(row)

    return response

export_as_excel.short_description = "Export selected to Excel"


def mark_profile_setup_complete(model_admin, request, queryset):
    updated = queryset.update(is_profile_setup=True)
    messages.success(request, f"{updated} patient profiles marked as complete.")

mark_profile_setup_complete.short_description = "Mark selected profiles as complete"


def mark_otp_used(model_admin, request, queryset):
    updated = queryset.update(is_used=True)
    messages.success(request, f"{updated} OTP records marked as used.")

mark_otp_used.short_description = "Mark selected OTPs as used"


def delete_expired_otps(model_admin, request, queryset):
    cutoff = timezone.now() - datetime.timedelta(minutes=5)
    expired = queryset.filter(created_at__lt=cutoff)
    count = expired.count()
    expired.delete()
    messages.success(request, f"{count} expired OTP records deleted.")

delete_expired_otps.short_description = "Delete expired OTPs"


# ──────────────────────────────────────────────────────────────────────────────
# User Admin
# ──────────────────────────────────────────────────────────────────────────────

class UserAdmin(DjangoUserAdmin):
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'role',
        'is_staff',
        'is_active',
        'date_joined',
        'last_login',
    )
    list_filter = (
        'role',
        'is_staff',
        'is_active',
        'date_joined',
        'last_login',
    )
    search_fields = (
        'username',
        'email',
        'first_name',
        'last_name',
        'mobile_number',
    )
    ordering = ('-date_joined',)
    list_per_page = 25
    date_hierarchy = 'date_joined'

    readonly_fields = ('last_login', 'date_joined')

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'email', 'mobile_number', 'role')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'role', 'password1', 'password2'),
        }),
    )

    actions = [export_as_csv, export_as_excel]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


# ──────────────────────────────────────────────────────────────────────────────
# Patient Profile Admin
# ──────────────────────────────────────────────────────────────────────────────

class PatientProfileAdmin(admin.ModelAdmin):
    list_display = (
        'healthcare_id',
        'full_name',
        'email',
        'contact_number',
        'gender',
        'blood_group',
        'age',
        'qr_status',
        'scan_count',
        'is_profile_setup',
        'registration_date',
    )
    list_filter = (
        'gender',
        'blood_group',
        'is_profile_setup',
        'user__date_joined',
        'user__is_active',
    )
    search_fields = (
        'healthcare_id',
        'user__username',
        'user__email',
        'user__first_name',
        'user__last_name',
        'contact_number',
        'address',
    )
    ordering = ('-user__date_joined',)
    list_per_page = 25
    date_hierarchy = 'user__date_joined'
    autocomplete_fields = ['user']

    readonly_fields = (
        'healthcare_id',
        'qr_token',
        'scan_count',
        'last_scanned_at',
        'qr_code_preview',
    )

    fieldsets = (
        (None, {
            'fields': ('user', 'healthcare_id', 'is_profile_setup'),
        }),
        ('Personal Information', {
            'fields': (
                'date_of_birth',
                'gender',
                'blood_type',
                'blood_group',
                'age',
                'contact_number',
                'address',
                'emergency_contact',
            ),
        }),
        ('Medical Information', {
            'fields': (
                'height',
                'weight',
                'major_allergies',
                'active_prescription',
                'current_medication',
                'recent_pain',
            ),
        }),
        ('QR & Profile', {
            'fields': (
                'qr_token',
                'qr_code_preview',
                'scan_count',
                'last_scanned_at',
            ),
        }),
        ('Insurance', {
            'fields': ('health_insurance_id',),
            'classes': ('collapse',),
        }),
    )

    inlines = [
        FamilyMemberProfileInline,
        PatientDocumentInline,
        MedicalHistoryEntryInline,
    ]

    actions = [export_as_csv, export_as_excel, mark_profile_setup_complete]

    def full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    full_name.short_description = "Full Name"
    full_name.admin_order_field = 'user__first_name'

    def email(self, obj):
        return obj.user.email
    email.short_description = "Email"
    email.admin_order_field = 'user__email'

    def registration_date(self, obj):
        return obj.user.date_joined.strftime('%Y-%m-%d')
    registration_date.short_description = "Registered"
    registration_date.admin_order_field = 'user__date_joined'

    def qr_status(self, obj):
        if obj.qr_token:
            return format_html('<span style="color: green;">✓ Generated</span>')
        return format_html('<span style="color: red;">✗ Not Generated</span>')
    qr_status.short_description = "QR Code"

    def qr_code_preview(self, obj):
        if obj.qr_token:
            url = reverse('admin:core_patientprofile_change', args=[obj.pk])
            return format_html(
                '<a href="{}" target="_blank">View QR Token: {}</a>',
                url, obj.qr_token
            )
        return "No QR token"
    qr_code_preview.short_description = "QR Preview"

    def delete_model(self, request, obj):
        user = obj.user
        super().delete_model(request, obj)
        if user and user.pk:
            user.delete()

    def delete_queryset(self, request, queryset):
        users = [obj.user for obj in queryset if obj.user_id]
        super().delete_queryset(request, queryset)
        for user in users:
            if user and user.pk:
                user.delete()

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'user',
        ).prefetch_related(
            'family_members',
            'documents',
            'history_entries',
        )


# ──────────────────────────────────────────────────────────────────────────────
# Family Member Admin
# ──────────────────────────────────────────────────────────────────────────────

class FamilyMemberProfileAdmin(admin.ModelAdmin):
    list_display = (
        'full_name',
        'patient_healthcare_id',
        'patient_name',
        'relationship',
        'gender',
        'blood_group',
        'age',
        'qr_status',
        'scan_count',
        'created_at',
    )
    list_filter = (
        'relationship',
        'gender',
        'blood_group',
        'created_at',
    )
    search_fields = (
        'first_name',
        'last_name',
        'relationship',
        'patient__healthcare_id',
        'patient__user__username',
        'patient__user__email',
    )
    ordering = ('-created_at',)
    list_per_page = 25
    date_hierarchy = 'created_at'
    autocomplete_fields = ['patient']

    readonly_fields = (
        'qr_token',
        'scan_count',
        'last_scanned_at',
        'qr_code_preview',
    )

    fieldsets = (
        (None, {
            'fields': ('patient', 'first_name', 'last_name', 'relationship'),
        }),
        ('Personal Information', {
            'fields': (
                'gender',
                'blood_group',
                'age',
                'emergency_contact',
            ),
        }),
        ('Medical Information', {
            'fields': (
                'height',
                'weight',
                'major_allergies',
                'active_prescription',
                'current_medication',
                'recent_pain',
            ),
        }),
        ('QR & Profile', {
            'fields': (
                'qr_token',
                'qr_code_preview',
                'scan_count',
                'last_scanned_at',
            ),
        }),
    )

    actions = [export_as_csv, export_as_excel]

    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    full_name.short_description = "Full Name"
    full_name.admin_order_field = 'first_name'

    def patient_healthcare_id(self, obj):
        return obj.patient.healthcare_id
    patient_healthcare_id.short_description = "Patient ID"
    patient_healthcare_id.admin_order_field = 'patient__healthcare_id'

    def patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username
    patient_name.short_description = "Patient Name"
    patient_name.admin_order_field = 'patient__user__first_name'

    def qr_status(self, obj):
        if obj.qr_token:
            return format_html('<span style="color: green;">✓ Generated</span>')
        return format_html('<span style="color: red;">✗ Not Generated</span>')
    qr_status.short_description = "QR Code"

    def qr_code_preview(self, obj):
        if obj.qr_token:
            url = reverse('admin:core_familymemberprofile_change', args=[obj.pk])
            return format_html(
                '<a href="{}" target="_blank">View QR Token: {}</a>',
                url, obj.qr_token
            )
        return "No QR token"
    qr_code_preview.short_description = "QR Preview"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'patient__user',
        ).prefetch_related(
            'documents',
        )


# ──────────────────────────────────────────────────────────────────────────────
# Medical History Admin
# ──────────────────────────────────────────────────────────────────────────────

class MedicalHistoryEntryAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'patient_healthcare_id',
        'patient_name',
        'category',
        'date_recorded',
    )
    list_filter = (
        'category',
        'date_recorded',
    )
    search_fields = (
        'title',
        'description',
        'patient__healthcare_id',
        'patient__user__username',
        'patient__user__email',
    )
    ordering = ('-date_recorded',)
    list_per_page = 25
    date_hierarchy = 'date_recorded'
    autocomplete_fields = ['patient']

    readonly_fields = ('date_recorded',)

    fieldsets = (
        (None, {
            'fields': ('patient', 'title', 'category'),
        }),
        ('Details', {
            'fields': ('description', 'date_recorded'),
        }),
    )

    actions = [export_as_csv, export_as_excel]

    def patient_healthcare_id(self, obj):
        return obj.patient.healthcare_id
    patient_healthcare_id.short_description = "Patient ID"
    patient_healthcare_id.admin_order_field = 'patient__healthcare_id'

    def patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username
    patient_name.short_description = "Patient Name"
    patient_name.admin_order_field = 'patient__user__first_name'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'patient__user',
        )


# ──────────────────────────────────────────────────────────────────────────────
# Patient Document Admin
# ──────────────────────────────────────────────────────────────────────────────

class PatientDocumentAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'patient_healthcare_id',
        'patient_name',
        'owner_type',
        'file_type',
        'file_size',
        'uploaded_at',
    )
    list_filter = (
        'file_type',
        'uploaded_at',
    )
    search_fields = (
        'title',
        'patient__healthcare_id',
        'patient__user__username',
        'patient__user__email',
        'family_member__first_name',
        'family_member__last_name',
    )
    ordering = ('-uploaded_at',)
    list_per_page = 25
    date_hierarchy = 'uploaded_at'
    autocomplete_fields = ['patient', 'family_member']

    readonly_fields = (
        'file_size',
        'file_type',
        'uploaded_at',
        'file_preview',
        'download_link',
    )

    fieldsets = (
        (None, {
            'fields': ('patient', 'family_member', 'title'),
        }),
        ('File Information', {
            'fields': (
                'file',
                'file_preview',
                'download_link',
                'file_size',
                'file_type',
                'uploaded_at',
            ),
        }),
    )

    actions = [export_as_csv, export_as_excel]

    def patient_healthcare_id(self, obj):
        return obj.patient.healthcare_id
    patient_healthcare_id.short_description = "Patient ID"
    patient_healthcare_id.admin_order_field = 'patient__healthcare_id'

    def patient_name(self, obj):
        return obj.patient.user.get_full_name() or obj.patient.user.username
    patient_name.short_description = "Patient Name"
    patient_name.admin_order_field = 'patient__user__first_name'

    def owner_type(self, obj):
        if obj.family_member:
            return format_html('<span style="color: orange;">Family: {}</span>', obj.family_member.full_name)
        return format_html('<span style="color: green;">Main Patient</span>')
    owner_type.short_description = "Owner"

    def file_preview(self, obj):
        if obj.file and hasattr(obj.file, 'url'):
            if obj.file_type and 'image' in obj.file_type.lower():
                return format_html(
                    '<img src="{}" style="max-height: 200px; max-width: 200px; border: 1px solid #ddd; padding: 5px; border-radius: 4px;" />',
                    obj.file.url,
                )
            elif obj.file_type and 'pdf' in obj.file_type.lower():
                return format_html(
                    '<a href="{}" target="_blank" class="button">View PDF</a>',
                    obj.file.url,
                )
            return format_html(
                '<a href="{}" target="_blank" class="button">Download File</a>',
                obj.file.url,
            )
        return "No file"
    file_preview.short_description = "Preview"

    def download_link(self, obj):
        if obj.file and hasattr(obj.file, 'url'):
            return format_html(
                '<a href="{}" download class="button">Download</a>',
                obj.file.url,
            )
        return "No file"
    download_link.short_description = "Download"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'patient__user',
            'family_member',
        )


# ──────────────────────────────────────────────────────────────────────────────
# Patient OTP Admin
# ──────────────────────────────────────────────────────────────────────────────

class PatientOTPAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'otp_code',
        'is_used',
        'is_expired_display',
        'created_at',
    )
    list_filter = (
        'is_used',
        'created_at',
    )
    search_fields = (
        'user__username',
        'user__email',
        'otp_code',
    )
    ordering = ('-created_at',)
    list_per_page = 25
    date_hierarchy = 'created_at'
    autocomplete_fields = ['user']

    readonly_fields = (
        'otp_code',
        'is_used',
        'created_at',
        'is_expired_display',
    )

    fieldsets = (
        (None, {
            'fields': ('user', 'otp_code', 'is_used'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'is_expired_display'),
        }),
    )

    actions = [mark_otp_used, delete_expired_otps]

    def is_expired_display(self, obj):
        if obj.is_expired:
            return format_html('<span style="color: red;">Expired</span>')
        return format_html('<span style="color: green;">Valid</span>')
    is_expired_display.short_description = "Status"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


# ──────────────────────────────────────────────────────────────────────────────
# Register with Default Admin Site
# ──────────────────────────────────────────────────────────────────────────────

admin.site.register(User, UserAdmin)
admin.site.register(PatientProfile, PatientProfileAdmin)
admin.site.register(FamilyMemberProfile, FamilyMemberProfileAdmin)
admin.site.register(MedicalHistoryEntry, MedicalHistoryEntryAdmin)
admin.site.register(PatientDocument, PatientDocumentAdmin)
admin.site.register(PatientOTP, PatientOTPAdmin)

class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('name', 'email', 'message')
    readonly_fields = ('created_at',)
    ordering = ['-created_at']

admin.site.register(ContactMessage, ContactMessageAdmin)

# Monkey-patch the admin index to inject dashboard data
from django.contrib import admin as django_admin
from .dashboard_data import get_dashboard_stats, get_chart_data

_original_index = django_admin.site.index

def _patched_index(request, extra_context=None):
    if not request.user or not request.user.is_active or not request.user.is_staff:
        return django_admin.site.login(request)

    stats = get_dashboard_stats()
    chart_data = get_chart_data()
    extra_context = extra_context or {}
    extra_context['stats'] = stats
    extra_context['chart_data'] = chart_data

    quick_links = [
        {"name": "Manage Patients", "url": "/admin/core/patientprofile/", "icon": "fas fa-hospital-user", "color": "primary"},
        {"name": "Documents", "url": "/admin/core/patientdocument/", "icon": "fas fa-file-medical", "color": "warning"},
        {"name": "Family Members", "url": "/admin/core/familymemberprofile/", "icon": "fas fa-user-friends", "color": "info"},
        {"name": "QR Analytics", "url": "/admin/core/patientprofile/", "icon": "fas fa-qrcode", "color": "secondary"},
        {"name": "OTP Management", "url": "/admin/core/patientotp/", "icon": "fas fa-key", "color": "dark"},
    ]
    extra_context['quick_links'] = quick_links

    return _original_index(request, extra_context)

django_admin.site.index = _patched_index
