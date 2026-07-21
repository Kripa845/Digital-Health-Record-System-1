from rest_framework import serializers
from apps.medical_history.models import MedicalHistoryEntry


class MedicalHistoryEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistoryEntry
        fields = ['id', 'patient', 'title', 'description', 'category', 'date_recorded']
        read_only_fields = ['id', 'patient', 'date_recorded']
