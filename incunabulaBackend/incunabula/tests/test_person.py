#Test para el modelo Person

# from django.test import TestCase
# from incunabula.models import Person
# from django.urls import reverse
# from rest_framework import status

# class PersonModelTest(TestCase):
    
#     def setUp(self):
#         self.person = Person.objects.create(
#             id="P1", 
#             role="creator", 
#             fullName="John Doe"
#         )

#     def test_person_list(self):
#         """Test para listar todas las personas"""
#         response = self.client.get(reverse('person-list'))
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_person_creation(self):
#         """Test para crear una nueva persona"""
#         data = {
#             'id': 'P2',
#             'role': 'printer',
#             'fullName': 'Jane Doe'
#         }
#         response = self.client.post(reverse('person-list'), data, format='json', content_type='application/json')
#         self.assertEqual(response.status_code, status.HTTP_201_CREATED)

#     def test_person_one(self):
#         """Test para obtener una persona"""
#         response = self.client.get(reverse('person-detail', args=['P1']))
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_person_update(self):
#         """Test para actualizar una persona"""
#         data = {
#             'role': 'creator',
#             'fullName': 'John Smith',
#         }
#         response = self.client.put(reverse('person-detail', args=['P1']), data, format='json', content_type='application/json')
#         self.assertEqual(response.status_code, status.HTTP_200_OK)

#     def test_person_delete(self):
#         """Test para eliminar una persona"""
#         response = self.client.delete(reverse('person-detail', args=['P1']))
#         self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

#     @classmethod
#     def tearDownClass(cls):
#         super().tearDownClass() 
#         print("\nTest Person OK")