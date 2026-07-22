from rest_framework import serializers
from apps.recommendations.models import DoctorRecommendation


class DoctorRecommendationSerializer(serializers.ModelSerializer):
    doctor = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = DoctorRecommendation
        fields = ['id', 'patient', 'doctor', 'symptoms', 'recommendation', 'match_score', 'timestamp']
        read_only_fields = ['id', 'timestamp']
