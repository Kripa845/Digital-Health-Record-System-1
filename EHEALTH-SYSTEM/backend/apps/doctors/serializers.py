from rest_framework import serializers
from .models import DoctorProfile


class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'doctor_id', 'first_name', 'middle_name', 'last_name',
            'gender', 'date_of_birth', 'age', 'phone_number', 'photo',
            'department', 'specialization', 'medical_license_number',
            'status', 'registration_date', 'created_by', 'availability',
            'assigned_patients',
        ]
        read_only_fields = ['id', 'doctor_id', 'age', 'registration_date']
