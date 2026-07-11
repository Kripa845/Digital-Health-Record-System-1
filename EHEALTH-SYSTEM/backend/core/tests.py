from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import PatientProfile, InstitutionProfile, MedicalHistoryEntry, MedicalReport

User = get_user_model()

class MedicalReportModelTestCase(TestCase):
    def setUp(self):
        self.patient_user = User.objects.create_user(
            username='patient1', email='p1@test.com', password='password123', role=User.Role.PATIENT
        )
        self.admin_user = User.objects.create_user(
            username='admin1', email='a1@test.com', password='password123', role=User.Role.ADMIN
        )
        self.patient = PatientProfile.objects.create(user=self.patient_user)
        self.institution = InstitutionProfile.objects.create(
            user=self.admin_user, license_number='LIC123', institution_name='General Hospital'
        )

    def test_create_medical_report(self):
        report = MedicalReport.objects.create(
            patient=self.patient,
            institution=self.institution,
            title='Flu Diagnosis',
            diagnosis='Influenza A',
            prescription='Oseltamivir, rest'
        )
        self.assertIsNotNone(report.id)
        self.assertEqual(report.patient.healthcare_id, self.patient.healthcare_id)

    def test_report_immutability(self):
        report = MedicalReport.objects.create(
            patient=self.patient,
            institution=self.institution,
            title='Flu Diagnosis',
            diagnosis='Influenza A',
            prescription='Oseltamivir, rest'
        )
        
        # Test edit/update blocks
        report.diagnosis = 'Updated Diagnosis'
        with self.assertRaises(PermissionDenied):
            report.save()

        # Test delete blocks
        with self.assertRaises(PermissionDenied):
            report.delete()


class EHealthAPITestCase(APITestCase):
    def setUp(self):
        # Create users
        self.patient_user = User.objects.create_user(
            username='pat', email='pat@test.com', password='password123', role=User.Role.PATIENT
        )
        self.patient = PatientProfile.objects.create(user=self.patient_user)

        self.inst_user = User.objects.create_user(
            username='inst', email='inst@test.com', password='password123', role=User.Role.ADMIN
        )
        self.institution = InstitutionProfile.objects.create(
            user=self.inst_user, license_number='LIC-999', institution_name='City Clinic'
        )

        # URLs
        self.login_url = reverse('token-obtain-pair')
        self.history_list_url = reverse('medical-history-list')
        self.report_list_url = reverse('medical-report-list')

    def test_patient_can_add_history_but_not_report(self):
        self.client.force_authenticate(user=self.patient_user)
        
        # Patient adds history entry
        response = self.client.post(self.history_list_url, {
            'title': 'Asthma diagnosis',
            'description': 'Diagnosed in childhood',
            'category': 'Chronic'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(MedicalHistoryEntry.objects.count(), 1)

        # Patient tries to add official report (should fail/forbidden or method disallowed if route permission blocks)
        response = self.client.post(self.report_list_url, {
            'patient': self.patient.id,
            'title': 'Fake Official Report',
            'diagnosis': 'None',
            'prescription': 'None'
        })
        # This should fail since perform_create blocks non-admins
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_add_report_but_not_edit(self):
        self.client.force_authenticate(user=self.inst_user)

        # Admin adds medical report
        response = self.client.post(self.report_list_url, {
            'healthcare_id': self.patient.healthcare_id,
            'title': 'Blood Test',
            'diagnosis': 'Normal glucose',
            'prescription': 'None required'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        report_id = response.data['id']

        # Try to update report (should return 405 Method Not Allowed because PUT/PATCH are not registered)
        detail_url = reverse('medical-report-detail', args=[report_id])
        response = self.client.put(detail_url, {
            'title': 'Modified title'
        })
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        response = self.client.patch(detail_url, {
            'title': 'Modified title'
        })
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        # Try to delete report (should return 405 Method Not Allowed)
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
