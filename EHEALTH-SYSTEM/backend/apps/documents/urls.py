from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import PatientDocumentViewSet

router = DefaultRouter()
router.register(r'', PatientDocumentViewSet, basename='patient-document')

urlpatterns = [
    path('', include(router.urls)),
]
