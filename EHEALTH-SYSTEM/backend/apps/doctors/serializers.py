from rest_framework import serializers
from apps.doctors.models import DoctorProfile
from apps.patients.models import PatientProfile


class DoctorProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'user', 'doctor_id', 'first_name', 'middle_name', 'last_name',
            'gender', 'date_of_birth', 'age', 'phone_number', 'photo', 'department',
            'specialization', 'medical_license_number', 'status', 'registration_date',
            'created_by'
        ]
        read_only_fields = ['id', 'doctor_id', 'registration_date']


class AssignedPatientSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = ['id', 'healthcare_id', 'full_name', 'gender', 'blood_group', 'age', 'contact_number', 'address', 'emergency_contact']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
