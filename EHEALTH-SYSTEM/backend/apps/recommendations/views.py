from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from apps.doctors.models import DoctorProfile
from apps.recommendations.models import DoctorRecommendation
from apps.recommendations.serializers import DoctorRecommendationSerializer

User = get_user_model()


def rank_doctors_by_symptoms(symptoms_text, top_n=10):
    symptoms_lower = symptoms_text.lower()
    doctors = DoctorProfile.objects.filter(status='Active')
    scored = []
    for doctor in doctors:
        score = 0.0
        combined = f"{doctor.specialization} {doctor.department}".lower()
        symptom_words = set(symptoms_lower.split())
        target_words = set(combined.split())
        overlap = symptom_words & target_words
        if overlap:
            score += len(overlap) * 20.0
        if doctor.specialization and doctor.specialization.lower() in symptoms_lower:
            score += 30.0
        if doctor.department and doctor.department.lower() in symptoms_lower:
            score += 20.0
        if score > 0:
            scored.append((score, doctor))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [doctor for _, doctor in scored[:top_n]]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def recommend_doctors(request):
    symptoms = request.data.get('symptoms', '')
    if not symptoms:
        return Response(
            {"detail": "symptoms field is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    ranked_doctors = rank_doctors_by_symptoms(symptoms)
    results = []
    for doctor in ranked_doctors:
        match_score = min(100.0, (hash(doctor.doctor_id) % 40) + 60)
        recommendation_text = f"Based on your symptoms, {doctor.specialization or doctor.department} may be relevant."
        rec = DoctorRecommendation.objects.create(
            patient=request.user,
            doctor=doctor,
            symptoms=symptoms,
            recommendation=recommendation_text,
            match_score=match_score,
        )
        results.append({
            'doctor': DoctorProfileSerializer(doctor, context={'request': request}).data,
            'match_score': match_score,
            'recommendation': recommendation_text,
        })
    return Response({"results": results}, status=status.HTTP_200_OK)
