from datetime import datetime, timedelta
from django.db.models import Count, Sum, Q, Case, When, Value, CharField
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models.functions import TruncMonth, TruncDate, Lower

User = get_user_model()


def get_dashboard_stats():
    """Real-time dashboard statistics directly from the database."""
    today = timezone.now()
    month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    week_start = today - timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    stats = {
        "total_users": User.objects.count(),
        "total_patients": 0,
        "total_admins": 0,
        "total_family_members": 0,
        "total_qr_generated": 0,
        "total_documents": 0,
        "total_medical_reports": 0,
        "total_active_users": 0,
        "total_verified_users": 0,
        "total_pending_requests": 0,
        "active_patients": 0,
        "new_patients_this_month": 0,
        "new_users_this_week": 0,
    }

    try:
        from .models import PatientProfile, FamilyMemberProfile, PatientDocument, MedicalHistoryEntry

        stats["total_patients"] = PatientProfile.objects.count()
        stats["total_admins"] = User.objects.filter(role="ADMIN").count()
        stats["total_family_members"] = FamilyMemberProfile.objects.count()
        stats["total_documents"] = PatientDocument.objects.count()
        stats["total_medical_reports"] = MedicalHistoryEntry.objects.count()
        stats["total_qr_generated"] = (
            PatientProfile.objects.filter(qr_token__isnull=False).count()
            + FamilyMemberProfile.objects.filter(qr_token__isnull=False).count()
        )
        patient_scans = PatientProfile.objects.aggregate(total=Sum("scan_count"))["total"] or 0
        family_scans = FamilyMemberProfile.objects.aggregate(total=Sum("scan_count"))["total"] or 0
        stats["total_qr_scans"] = patient_scans + family_scans
        stats["active_patients"] = PatientProfile.objects.filter(is_profile_setup=True).count()
        stats["total_verified_users"] = PatientProfile.objects.filter(is_profile_setup=True).count()
        stats["total_active_users"] = User.objects.filter(is_active=True).count()
        stats["total_pending_requests"] = User.objects.filter(is_active=False).count()
        stats["new_patients_this_month"] = PatientProfile.objects.filter(
            user__date_joined__gte=month_start
        ).count()
        stats["new_users_this_week"] = User.objects.filter(
            date_joined__gte=week_start
        ).count()
    except ImportError:
        pass

    return stats


def get_chart_data():
    """Real-time chart data directly from the database."""
    today = timezone.now()
    months = []
    for i in range(11, -1, -1):
        d = today - timedelta(days=30 * i)
        months.append(d.strftime("%b %Y"))

    registrations_by_month = [0] * 12
    qr_scans_by_month = [0] * 12
    documents_by_month = [0] * 12
    qr_generated_by_month = [0] * 12

    try:
        from .models import PatientProfile, PatientDocument, FamilyMemberProfile

        # Registrations by month
        regs = (
            PatientProfile.objects.filter(
                user__date_joined__gte=today - timedelta(days=365)
            )
            .annotate(month=TruncMonth("user__date_joined"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        for r in regs:
            if r["month"]:
                month_idx = (r["month"].year - today.year) * 12 + (r["month"].month - today.month)
                if 0 <= month_idx < 12:
                    registrations_by_month[11 - month_idx] = r["count"]

        # QR scans by month (unique profiles last scanned in each month)
        patient_scans = (
            PatientProfile.objects.filter(
                last_scanned_at__gte=today - timedelta(days=365)
            )
            .annotate(month=TruncMonth("last_scanned_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        for s in patient_scans:
            if s["month"]:
                month_idx = (s["month"].year - today.year) * 12 + (s["month"].month - today.month)
                if 0 <= month_idx < 12:
                    qr_scans_by_month[11 - month_idx] += s["count"] or 0

        family_scans = (
            FamilyMemberProfile.objects.filter(
                last_scanned_at__gte=today - timedelta(days=365)
            )
            .annotate(month=TruncMonth("last_scanned_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        for s in family_scans:
            if s["month"]:
                month_idx = (s["month"].year - today.year) * 12 + (s["month"].month - today.month)
                if 0 <= month_idx < 12:
                    qr_scans_by_month[11 - month_idx] += s["count"] or 0

        # Documents by month
        docs = (
            PatientDocument.objects.filter(
                uploaded_at__gte=today - timedelta(days=365)
            )
            .annotate(month=TruncMonth("uploaded_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        for d in docs:
            if d["month"]:
                month_idx = (d["month"].year - today.year) * 12 + (d["month"].month - today.month)
                if 0 <= month_idx < 12:
                    documents_by_month[11 - month_idx] = d["count"]

        # QR generated by month (profiles with qr_token created in that month)
        patient_qr = (
            PatientProfile.objects.filter(
                qr_token__isnull=False,
                user__date_joined__gte=today - timedelta(days=365)
            )
            .annotate(month=TruncMonth("user__date_joined"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        for q in patient_qr:
            if q["month"]:
                month_idx = (q["month"].year - today.year) * 12 + (q["month"].month - today.month)
                if 0 <= month_idx < 12:
                    qr_generated_by_month[11 - month_idx] += q["count"] or 0

        family_qr = (
            FamilyMemberProfile.objects.filter(
                qr_token__isnull=False,
                created_at__gte=today - timedelta(days=365)
            )
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        for q in family_qr:
            if q["month"]:
                month_idx = (q["month"].year - today.year) * 12 + (q["month"].month - today.month)
                if 0 <= month_idx < 12:
                    qr_generated_by_month[11 - month_idx] += q["count"] or 0

    except ImportError:
        pass

    gender_data = {"Male": 0, "Female": 0, "Other": 0}
    blood_group_data = {}
    role_data = {"Patient": 0, "Admin": 0}

    try:
        from .models import PatientProfile, FamilyMemberProfile

        # Gender distribution - normalize case and whitespace
        gender_counts = (
            PatientProfile.objects.exclude(gender__isnull=True)
            .exclude(gender__exact="")
            .annotate(
                norm_gender=Case(
                    When(gender__iexact="male", then=Value("Male")),
                    When(gender__iexact="female", then=Value("Female")),
                    When(gender__iexact="other", then=Value("Other")),
                    default=Value("Other"),
                    output_field=CharField(),
                )
            )
            .values("norm_gender")
            .annotate(count=Count("id"))
        )
        for item in gender_counts:
            gender = item["norm_gender"]
            if gender in gender_data:
                gender_data[gender] = item["count"]

        # Blood group distribution
        blood_qs = (
            PatientProfile.objects.exclude(blood_group="")
            .exclude(blood_group__isnull=True)
            .values("blood_group")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        for item in blood_qs:
            bg = item["blood_group"].strip()
            if bg:
                blood_group_data[bg] = item["count"]

        # Role distribution
        role_counts = User.objects.values("role").annotate(count=Count("id"))
        for item in role_counts:
            role = item["role"]
            if role == "PATIENT":
                role_data["Patient"] = item["count"]
            elif role == "ADMIN":
                role_data["Admin"] = item["count"]

    except ImportError:
        pass

    return {
        "months": months,
        "registrations": registrations_by_month,
        "qr_scans": qr_scans_by_month,
        "documents": documents_by_month,
        "qr_generated": qr_generated_by_month,
        "gender": gender_data,
        "blood_groups": blood_group_data,
        "roles": role_data,
    }


def get_recent_activity():
    """Recent activity data for dashboard widgets."""
    recent = {
        "recent_patients": [],
        "recent_documents": [],
        "recent_users": [],
        "recent_qr_scans": [],
        "recent_family_members": [],
    }

    try:
        from .models import PatientProfile, PatientDocument, User, FamilyMemberProfile, MedicalHistoryEntry, ContactMessage

        # Recent patients
        recent_patients_qs = (
            PatientProfile.objects.select_related("user")
            .order_by("-user__date_joined")[:5]
        )
        recent["recent_patients"] = [
            {
                "name": p.user.get_full_name() or p.user.username,
                "healthcare_id": p.healthcare_id,
                "date": p.user.date_joined,
                "email": p.user.email,
                "type": "Patient Registration",
            }
            for p in recent_patients_qs
        ]

        # Recent documents
        recent_documents_qs = (
            PatientDocument.objects.select_related("patient__user", "family_member")
            .order_by("-uploaded_at")[:5]
        )
        recent["recent_documents"] = [
            {
                "title": d.title,
                "patient": d.patient.user.get_full_name() or d.patient.user.username,
                "owner": "Family" if d.family_member else "Main",
                "date": d.uploaded_at,
                "file_type": d.file_type,
                "type": "Document Upload",
            }
            for d in recent_documents_qs
        ]

        # Recent users
        recent_users_qs = (
            User.objects.order_by("-date_joined")[:5]
        )
        recent["recent_users"] = [
            {
                "username": u.username,
                "role": u.role,
                "date": u.date_joined,
                "is_active": u.is_active,
                "type": "User Registration",
            }
            for u in recent_users_qs
        ]

        # Recent QR scans
        recent_qr_scans = (
            PatientProfile.objects.filter(last_scanned_at__isnull=False)
            .select_related("user")
            .order_by("-last_scanned_at")[:5]
        )
        recent["recent_qr_scans"] = [
            {
                "name": p.user.get_full_name() or p.user.username,
                "healthcare_id": p.healthcare_id,
                "scan_count": p.scan_count,
                "last_scanned": p.last_scanned_at,
                "type": "QR Scan",
            }
            for p in recent_qr_scans
        ]

        # Recent family members
        recent_family = (
            FamilyMemberProfile.objects.select_related("patient__user")
            .order_by("-created_at")[:5]
        )
        recent["recent_family_members"] = [
            {
                "name": f"{f.first_name} {f.last_name}",
                "relationship": f.relationship,
                "patient": f.patient.user.get_full_name() or f.patient.user.username,
                "date": f.created_at,
                "type": "Family Member Added",
            }
            for f in recent_family
        ]

    except ImportError:
        pass

    return recent


def get_filter_options():
    """Dynamic filter options for dashboard."""
    options = {
        "genders": ["Male", "Female", "Other"],
        "blood_groups": [],
        "roles": ["PATIENT", "ADMIN"],
        "document_types": [],
        "verification_status": ["Verified", "Unverified"],
        "active_status": ["Active", "Inactive"],
    }

    try:
        from .models import PatientProfile, PatientDocument, FamilyMemberProfile

        # Blood groups from DB
        blood_groups = (
            PatientProfile.objects.exclude(blood_group="")
            .exclude(blood_group__isnull=True)
            .values_list("blood_group", flat=True)
            .distinct()
            .order_by("blood_group")
        )
        options["blood_groups"] = list(blood_groups)

        # Document types from DB
        doc_types = (
            PatientDocument.objects.exclude(file_type="")
            .exclude(file_type__isnull=True)
            .values_list("file_type", flat=True)
            .distinct()
            .order_by("file_type")
        )
        options["document_types"] = list(doc_types)

    except ImportError:
        pass

    return options
