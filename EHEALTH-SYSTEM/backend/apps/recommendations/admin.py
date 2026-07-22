from django.contrib import admin
from apps.recommendations.models import DoctorRecommendation

@admin.register(DoctorRecommendation)
class DoctorRecommendationAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'match_score', 'timestamp']
    search_fields = ['patient__username', 'doctor__doctor_id', 'symptoms']
    list_filter = ['timestamp', 'match_score']
    readonly_fields = ['timestamp']
