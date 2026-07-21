from datetime import datetime, timedelta
from django.db.models import Count, Sum, Q
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db.models.functions import TruncMonth, TruncDate

User = get_user_model()


def get_dashboard_stats():
    today = timezone.now()
    month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    stats = {
        "total_patients": User.objects.filter(role="PATIENT").count(),
        "total_family_members": 0,
        "total_medical_records": 0,
        "total_documents": 0,
        "total_qr_generated": 0,
        "total_qr_scans": 0,
        "active_patients": 0,
        "new_patients_this_month": 0,
    }

    try:
        from .models import PatientProfile, FamilyMemberProfile, MedicalHistoryEntry, PatientDocument

        stats["total_family_members"] = FamilyMemberProfile.objects.count()
        stats["total_medical_records"] = MedicalHistoryEntry.objects.count()
        stats["total_documents"] = PatientDocument.objects.count()
        stats["total_qr_generated"] = PatientProfile.objects.filter(qr_token__isnull=False).count()
        stats["total_qr_scans"] = PatientProfile.objects.aggregate(total=Sum("scan_count"))["total"] or 0
        stats["active_patients"] = PatientProfile.objects.filter(is_profile_setup=True).count()
        stats["new_patients_this_month"] = PatientProfile.objects.filter(
            user__date_joined__gte=month_start
        ).count()
    except ImportError:
        pass

    return stats


def get_chart_data():
    today = timezone.now()
    months = []
    for i in range(11, -1, -1):
        d = today - timedelta(days=30 * i)
        months.append(d.strftime("%b %Y"))

    registrations_by_month = [0] * 12
    qr_scans_by_month = [0] * 12
    documents_by_month = [0] * 12

    try:
        from .models import PatientProfile, PatientDocument, MedicalHistoryEntry

        # Registrations by month — truncate date_joined to month, then group
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

        # QR scans by month
        scans = (
            PatientProfile.objects.filter(
                last_scanned_at__gte=today - timedelta(days=365)
            )
            .annotate(month=TruncMonth("last_scanned_at"))
            .values("month")
            .annotate(count=Sum("scan_count"))
            .order_by("month")
        )
        for s in scans:
            if s["month"]:
                month_idx = (s["month"].year - today.year) * 12 + (s["month"].month - today.month)
                if 0 <= month_idx < 12:
                    qr_scans_by_month[11 - month_idx] = s["count"] or 0

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

    except ImportError:
        pass

    gender_data = {"Male": 0, "Female": 0, "Other": 0}
    blood_group_data = {}

    try:
        from .models import PatientProfile, FamilyMemberProfile

        # Gender distribution
        male = PatientProfile.objects.filter(gender__iexact="Male").count()
        female = PatientProfile.objects.filter(gender__iexact="Female").count()
        other = PatientProfile.objects.filter(gender__iexact="Other").count()
        gender_data = {"Male": male, "Female": female, "Other": other}

        # Blood group distribution
        blood_qs = PatientProfile.objects.exclude(blood_group="").values("blood_group").annotate(count=Count("id"))
        for item in blood_qs:
            bg = item["blood_group"].strip()
            if bg:
                blood_group_data[bg] = item["count"]

    except ImportError:
        pass

    category_data = {}
    try:
        from .models import MedicalHistoryEntry
        cat_qs = MedicalHistoryEntry.objects.values("category").annotate(count=Count("id"))
        for item in cat_qs:
            category_data[item["category"]] = item["count"]
    except ImportError:
        pass

    return {
        "months": months,
        "registrations": registrations_by_month,
        "qr_scans": qr_scans_by_month,
        "documents": documents_by_month,
        "gender": gender_data,
        "blood_groups": blood_group_data,
        "categories": category_data,
    }
