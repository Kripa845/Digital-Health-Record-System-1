from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import MedicalHistoryEntryViewSet

router = DefaultRouter()
router.register(r'', MedicalHistoryEntryViewSet, basename='medical-history')

urlpatterns = [
    path('', include(router.urls)),
]
