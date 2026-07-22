from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.doctors.views import DoctorProfileViewSet

router = DefaultRouter()
router.register(r'', DoctorProfileViewSet, basename='doctor-profile')

urlpatterns = [
    path('', include(router.urls)),
]
