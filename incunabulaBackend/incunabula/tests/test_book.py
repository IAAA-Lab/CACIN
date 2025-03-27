#Test para el modelo Book

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from incunabula.models import Book, Office


class BookTest(TestCase):
    
    def setUp(self):
        self.office = Office.objects.create(
            id="O1", 
            officeName="Test Office"
        )
        self.book = Book.objects.create(
            id="1", 
            title="Test Book", 
            creator="John Doe", 
            publisher="Test Publisher", 
            location="Test Location", 
            date=2021,
            printingOffice=self.office
        )

    def test_book_list(self):
        """Test para listar todos los libros"""
        response = self.client.get(reverse('book-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_book_one(self):
        """Test para obtener un libro"""
        response = self.client.get(reverse('book-detail', args=[1]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_book_creation(self):
         """Test para crear un nuevo libro"""
         data = {
             'id': "2",
             'title': 'New Book',
             'location': 'New Location',
             'creator': 'New Creator',
             'publisher': 'New Publisher',
             'date': 2021,
             }
         response = self.client.post(reverse('book-list'), data, format='json')
         self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_book_update(self):
        """Test para actualizar un libro"""
        data = {
            'title': 'Updated Book',
            'location': 'Updated Location',
        }
        response = self.client.put(reverse('book-detail', args=[1]), data, format='json', content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_book_delete(self):
        """Test para eliminar un libro"""
        response = self.client.delete(reverse('book-detail', args=[1]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass() 
        print("\nTest Book OK")