from django.db import models
from django.conf import settings


class DoctorRecommendation(models.Model):
    class Meta:
        app_label = 'core'
        ordering = ['-match_score', '-timestamp']

    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_recommendations')
    doctor = models.ForeignKey('core.DoctorProfile', on_delete=models.CASCADE, related_name='recommendations')
    symptoms = models.TextField()
    recommendation = models.TextField()
    match_score = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommendation: {self.doctor} for {self.patient} ({self.match_score}%)"
