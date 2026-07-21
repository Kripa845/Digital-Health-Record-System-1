from rest_framework import serializers
from apps.family.models import FamilyMemberProfile


class FamilyMemberProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMemberProfile
        fields = [
            'id', 'patient', 'first_name', 'last_name', 'relationship', 'age', 'gender', 
            'blood_group', 'emergency_contact', 'major_allergies', 'height', 'weight', 
            'active_prescription', 'current_medication', 'recent_pain', 'qr_token', 'created_at',
        ]
        read_only_fields = ['id', 'patient', 'qr_token', 'created_at']
