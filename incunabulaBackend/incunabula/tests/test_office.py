#Test para el modelo Office

from django.test import TestCase
from incunabula.models import Office
from django.urls import reverse
from rest_framework import status

class OfficeModelTest(TestCase):
    
    def setUp(self):
        self.office = Office.objects.create(
            id="O1", 
            officeName="Test Office",
            alternativeName="Alternative Office",
            location="Test Location",
            foundedYear=1990,
            closedYear=2020
        )

    def test_office_list(self):
        """Test para listar todas las oficinas"""
        response = self.client.get(reverse('office-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_office_one(self):
        """Test para obtener una oficina"""
        response = self.client.get(reverse('office-detail', args=['O1']))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_office_creation(self):
        """Test para crear una nueva oficina"""
        data = {
            'id': 'O2',
            'officeName': 'New Office',
            'alternativeName': 'Alternative Office',
            'location': 'New Location',
            'foundedYear': 1990,
            'closedYear': 2020
        }
        response = self.client.post(reverse('office-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_office_update(self):
        """Test para actualizar una oficina"""
        data = {
            'officeName': 'Updated Office',
            'alternativeName': 'Alternative Office',
        }
        response = self.client.put(reverse('office-detail', args=['O1']), data, format='json', content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_office_delete(self):
        """Test para eliminar una oficina"""
        response = self.client.delete(reverse('office-detail', args=['O1']))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass() 
        print("\nTest Office OK")