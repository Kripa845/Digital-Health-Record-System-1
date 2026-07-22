from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import (
    CustomTokenObtainPairView,
    RegisterPatientView,
    login_init,
    login_verify,
    forgot_password,
    reset_password,
    verify_reset_otp,
    health_check,
    public_profile,
    generate_qr_code,
    get_qr_token,
    AdminStatsView,
)
from apps.contact.views import contact_message_create
from apps.patients.views import PatientProfileViewSet
from apps.medical_history.views import MedicalHistoryEntryViewSet
from apps.documents.views import PatientDocumentViewSet

router = DefaultRouter()
router.register(r'patients', PatientProfileViewSet, basename='patient-profile')
router.register(r'history', MedicalHistoryEntryViewSet, basename='medical-history')
router.register(r'documents', PatientDocumentViewSet, basename='patient-document')

urlpatterns = [
    path('auth/register/patient/', RegisterPatientView.as_view(), name='register-patient'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('auth/login-init/', login_init, name='login-init'),
    path('auth/login-verify/', login_verify, name='login-verify'),
    path('auth/verify-reset-otp/', verify_reset_otp, name='verify-reset-otp'),
    path('auth/forgot-password/', forgot_password, name='forgot-password'),
    path('auth/reset-password/', reset_password, name='reset-password'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('health/', health_check, name='health-check'),
    path('public-profile/<uuid:token>/', public_profile, name='public-profile'),
    path('qr-token/<str:profile_type>/<int:profile_id>/', get_qr_token, name='get-qr-token'),
    path('qr-token/me/', get_qr_token, name='get-qr-token-me'),
    path('generate-qr/', generate_qr_code, name='generate-qr'),
    path('admin-stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('contact/', contact_message_create, name='contact-message-create'),
    path('', include(router.urls)),
]
