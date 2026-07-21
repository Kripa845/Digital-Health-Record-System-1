from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.views import (
    CustomTokenObtainPairView,
    RegisterPatientView,
    PatientProfileViewSet,
    MedicalHistoryEntryViewSet,
    FamilyMemberProfileViewSet,
    PatientDocumentViewSet,
    login_init,
    login_verify,
    forgot_password,
    reset_password,
    public_profile,
    verify_reset_otp,
    health_check,
    get_qr_token
)

router = DefaultRouter()
router.register(r'patients', PatientProfileViewSet, basename='patient-profile')
router.register(r'history', MedicalHistoryEntryViewSet, basename='medical-history')
router.register(r'family', FamilyMemberProfileViewSet, basename='family-member')
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
    path('', include(router.urls)),
]
