from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction

from apps.accounts.models import User
from apps.patients.models import PatientProfile
from apps.family.models import FamilyMemberProfile
from apps.medical_history.models import MedicalHistoryEntry
from apps.documents.models import PatientDocument


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'mobile_number', 'first_name', 'last_name', 'role']
        read_only_fields = ['id', 'role']


class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = PatientProfile
        fields = [
            'id', 'user', 'healthcare_id', 'health_insurance_id', 'date_of_birth', 'gender', 
            'blood_type', 'contact_number', 'address', 'age', 'blood_group', 'emergency_contact', 
            'major_allergies', 'height', 'weight', 'active_prescription', 'current_medication', 
            'recent_pain', 'is_profile_setup', 'qr_token', 'scan_count', 'last_scanned_at'
        ]
        read_only_fields = ['id', 'healthcare_id', 'qr_token', 'scan_count', 'last_scanned_at']


class FamilyMemberProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyMemberProfile
        fields = [
            'id', 'patient', 'first_name', 'last_name', 'relationship', 'age', 'gender', 
            'blood_group', 'emergency_contact', 'major_allergies', 'height', 'weight', 
            'active_prescription', 'current_medication', 'recent_pain', 'qr_token', 'created_at',
        ]
        read_only_fields = ['id', 'patient', 'qr_token', 'created_at']


class PatientDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientDocument
        fields = ['id', 'patient', 'family_member', 'title', 'file', 'file_url', 'file_size', 'file_type', 'uploaded_at']
        read_only_fields = ['id', 'patient', 'uploaded_at', 'file_size', 'file_type']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class RegisterPatientSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    health_insurance_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    blood_type = serializers.CharField(required=False, allow_blank=True)
    contact_number = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    mobile_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'mobile_number', 'first_name', 'last_name', 
                  'health_insurance_id', 'date_of_birth', 'gender', 'blood_type', 'contact_number', 'address']

    def validate(self, attrs):
        email = attrs.get('email')
        mobile_number = attrs.get('mobile_number')
        if not email and not mobile_number:
            raise serializers.ValidationError("Either Email or Mobile Number must be provided.")
        
        if email:
            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError({"email": "A user with this email already exists."})
        if mobile_number:
            if User.objects.filter(mobile_number=mobile_number).exists():
                raise serializers.ValidationError({"mobile_number": "A user with this mobile number already exists."})
                
        return attrs

    def create(self, validated_data):
        profile_data = {
            'health_insurance_id': validated_data.pop('health_insurance_id', None),
            'date_of_birth': validated_data.pop('date_of_birth', None),
            'gender': validated_data.pop('gender', ''),
            'blood_type': validated_data.pop('blood_type', ''),
            'contact_number': validated_data.pop('contact_number', ''),
            'address': validated_data.pop('address', '')
        }
        
        mobile_number = validated_data.pop('mobile_number', '')
        email = validated_data.pop('email', '')
        
        with transaction.atomic():
            user = User.objects.create_user(
                username=validated_data['username'],
                email=email or None,
                mobile_number=mobile_number or None,
                password=validated_data['password'],
                first_name=validated_data.get('first_name', ''),
                last_name=validated_data.get('last_name', ''),
                role=User.Role.PATIENT
            )
            PatientProfile.objects.create(user=user, **profile_data)
            
        return user


class MedicalHistoryEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistoryEntry
        fields = ['id', 'patient', 'title', 'description', 'category', 'date_recorded']
        read_only_fields = ['id', 'patient', 'date_recorded']


class PublicProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientProfile
        fields = [
            "full_name",
            "blood_group",
            "age",
            "gender",
            "allergies",
            "medical_conditions",
            "emergency_contacts",
            "documents",
        ]
