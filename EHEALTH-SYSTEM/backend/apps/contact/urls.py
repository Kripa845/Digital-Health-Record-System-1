from django.urls import path
from .views import contact_message_create

urlpatterns = [
    path('contact/', contact_message_create, name='contact-message-create'),
]
