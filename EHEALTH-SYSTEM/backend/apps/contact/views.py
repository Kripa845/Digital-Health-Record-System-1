from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import ContactMessage
from .serializers import ContactMessageSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_message_create(request):
    serializer = ContactMessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(is_read=False)
        return Response({
            'success': True,
            'message': 'Thank you. Our compliance officer will reach back to your email within 1 hour.',
        }, status=status.HTTP_201_CREATED)
    return Response({
        'success': False,
        'errors': serializer.errors,
    }, status=status.HTTP_400_BAD_REQUEST)
