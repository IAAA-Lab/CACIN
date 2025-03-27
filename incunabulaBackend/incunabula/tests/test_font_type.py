#Test para el modelo FontType

from django.test import TestCase
from incunabula.models import FontType, Office
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

class FontTypeTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.font_type = FontType.objects.create(
            id="font1", 
            height=12, 
            mShape="round", 
            officeID=Office.objects.create(id="O1", officeName="Test Office")
        )

    def test_fonttype_list(self):
        """Test para listar todos los FontTypes"""
        response = self.client.get(reverse('fonttype-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fonttype_one(self):
        """Test para obtener un FontType"""
        response = self.client.get(reverse('fonttype-detail', args=['font1']))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fonttype_creation(self):
        """Test para crear un nuevo FontType"""
        data = {
            'id': 'font2',
            'height': 14,
            'mShape': 'square',
            'officeID': 'O1'
        }
        response = self.client.post(reverse('fonttype-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_fonttype_update(self):
        """Test para actualizar un FontType"""
        data = {
            'height': 16,
            'mShape': 'updatedShape',
            'officeID': 'O1'
        }
        response = self.client.put(reverse('fonttype-detail', args=['font1']), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_fonttype_delete(self):
        """Test para eliminar un FontType"""
        response = self.client.delete(reverse('fonttype-detail', args=['font1']))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        print("\nTest Font Type OK")