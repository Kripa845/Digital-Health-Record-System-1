from django.urls import path
from apps.recommendations.views import recommend_doctors

urlpatterns = [
    path('recommend/', recommend_doctors, name='recommend-doctors'),
]
