from django.urls import path, include
from rest_framework.routers import DefaultRouter
<<<<<<< HEAD
from .views import DoctorProfileViewSet

router = DefaultRouter()
router.register(r'doctors', DoctorProfileViewSet, basename='doctor-profile')
=======
from apps.doctors.views import DoctorProfileViewSet

router = DefaultRouter()
router.register(r'', DoctorProfileViewSet, basename='doctor-profile')
>>>>>>> c47456f7800640b06be9d45b184323eeaa77dee9

urlpatterns = [
    path('', include(router.urls)),
]
