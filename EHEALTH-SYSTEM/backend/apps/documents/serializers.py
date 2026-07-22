from rest_framework import serializers
from apps.documents.models import PatientDocument


class PatientDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientDocument
        fields = ['id', 'patient', 'title', 'file', 'file_url', 'file_size', 'file_type', 'uploaded_at']
        read_only_fields = ['id', 'patient', 'uploaded_at', 'file_size', 'file_type']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
