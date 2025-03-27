from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password

class UserTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='test@gmail.com',
            password='1234',  # Django encripta esta contraseña al usar create_user
            username='test',
            role=0
        )

    
    def test_password_is_hashed(self):
        """Test para verificar que la contraseña se guarda encriptada"""
        user = get_user_model().objects.get(email='test@gmail.com')
        self.assertNotEqual(user.password, '1234')  # La contraseña no debe guardarse en texto plano
        self.assertTrue(check_password('1234', user.password))  # Verifica que esté correctamente encriptada

    def test_login_successful(self):
        """Test para login exitoso"""
        response = self.client.post(reverse('login_user'), {
            'email': 'test@gmail.com',
            'password': '1234'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('refresh', response.data)
        self.assertIn('access', response.data)

    def test_login_unsuccessful(self):
        """Test para login fallido"""
        response = self.client.post(reverse('login_user'), {
            'email': 'test@gmail.com',
            'password': 'wrongpassword'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['message'], 'Invalid credentials')

    def test_create_user_with_invalid_data(self):
        """Test para la creación de usuario con datos inválidos"""
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(email='', password='1234')

    def test_create_user_successful(self):
        """Test para crear un usuario exitosamente"""
        payload = {
            'email': 'newuser@example.com',
            'password': 'password1234',
            'username': 'newuser',
            'role': 0
        }

        response = self.client.post(reverse('create_user'), payload, format='json')

        # Verificar que la respuesta fue exitosa
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verificar que el usuario fue creado en la base de datos
        user = get_user_model().objects.get(email='newuser@example.com')
        self.assertIsNotNone(user)
        self.assertTrue(user.check_password('password1234'))  # Verificar que la contraseña esté encriptada

        # Verificar que los otros campos se guardaron correctamente
        self.assertEqual(user.username, 'newuser')
        self.assertEqual(user.email, 'newuser@example.com')
        self.assertEqual(user.role, 0)


    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        print("\nTest User OK")