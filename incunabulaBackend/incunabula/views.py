#deleteimport boto3
import environ
import os

from django.http.response import Http404, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from incunabula.models import Book, Office, User, FontType, FontTypeBook
from incunabulaBackend.settings import BASE_DIR
from .serializers import BookSerializer, OfficeSerializer, FontTypeSerializer, UserSerializer
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from django.http import JsonResponse

from django.conf import settings

# Inicializa el entorno
env = environ.Env(
    # Establecer valores predeterminados si no existen en el archivo .env
    DEBUG=(bool, False)
)

# Lee el archivo .env
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

@csrf_exempt
# def generate_upload_url(request):
    # bucket_endpoint = os.getenv('BUCKET_ENDPOINT')
    # access_key = os.getenv('BUCKET_ACCESS_KEY')
    # secret_key = os.getenv('BUCKET_SECRET_ACCESS')
    # url_base = os.getenv('BUCKET_URL_BASE')

    # image_file = request.FILES["file"]
    # print("Peticion")
    # id = request.POST.get('id')

    # # Generar un nombre de archivo único
    # file_name = f"{id}.tiff"
    
    # s3 = boto3.client(
        # "s3",
        # endpoint_url=bucket_endpoint,
        # aws_access_key_id=access_key,
        # aws_secret_access_key=secret_key,
    # )

    # # Subir el archivo
    # s3.upload_fileobj(image_file, 'bookimage', file_name)
    
    # file_url = f"{url_base}{file_name}"
    # return JsonResponse({'key': file_url}) #delete cloudfare

# def generate_upload_url(request):
    # """
    # Handle file uploads and save them locally instead of uploading to S3.
    
    # Parameters:
        # request: Django HttpRequest object containing the file and other data.

    # Returns:
        # JsonResponse: JSON response with the file's local path.
    # """
    # # Define the local directory where files will be saved
    # local_save_dir = os.path.join(os.getcwd(), "uploads")
    # if not os.path.exists(local_save_dir):
        # os.makedirs(local_save_dir)

    # # Get the uploaded file and associated data
    # image_file = request.FILES["file"]
    # print("Processing request...")
    # record_id = request.POST.get('id')

    # # Generate a unique filename
    # file_name = f"{record_id}.tiff"
    # file_path = os.path.join(local_save_dir, file_name)

    # # Save the file locally
    # try:
        # with open(file_path, 'wb') as f:
            # for chunk in image_file.chunks():
                # f.write(chunk)
        # print(f"File saved locally at {file_path}")
    # except Exception as e:
        # return JsonResponse({'error': f"Failed to save file: {str(e)}"}, status=500)



    # # Dynamically generate the file URL using the request object
    # # Use the request's `scheme` (http or https) and `get_host()` to build the full URL
    # protocol = request.scheme  # "http" or "https"
    # host = request.get_host()  # domain name and port (if any)
    # file_url = f"{protocol}://{host}/uploads/{file_name}"  # Full dynamic URL
    
    
    
    # # Construct the file URL (if serving files locally)
    # #file_url = f"/uploads/{file_name}"  # Adjust based on how files are served
    # return JsonResponse({'key': file_url})

#second try     
def generate_upload_url(request):
    """
    Handle file uploads and save them locally instead of uploading to S3.
    
    Parameters:
        request: Django HttpRequest object containing the file and other data.

    Returns:
        JsonResponse: JSON response with the file's local path.
    """
    # Define the local directory where files will be saved
    local_save_dir = settings.UPLOADS_ROOT
    if not os.path.exists(local_save_dir):
        os.makedirs(local_save_dir)

    # Get the uploaded file and associated data
    image_file = request.FILES["file"]
    print("Processing request...")
    record_id = request.POST.get('id')

    # Generate a unique filename
    file_name = f"{record_id}.tiff"
    file_path = os.path.join(local_save_dir, file_name)

    # Save the file locally
    try:
        with open(file_path, 'wb') as f:
            for chunk in image_file.chunks():
                f.write(chunk)
        print(f"File saved locally at {file_path}")
    except Exception as e:
        return JsonResponse({'error': f"Failed to save file: {str(e)}"}, status=500)

    # Dynamically generate the file URL using the request object
    protocol = request.scheme  # "http" or "https"
    host = request.get_host()  # domain name and port (if any)
    file_url = file_name  # Full dynamic URL

    return JsonResponse({'key': file_url})
    
        
@api_view(['GET'])
def get_fontTypes_offices(request):
    try:
        offices = Office.objects.all()
    except Office.DoesNotExist:
        raise Http404("Offices not found")
    
    result = []

    for office in offices:
        fontTypes = FontType.objects.filter(officeID=office).distinct().values_list('id', flat=True)
        
        office_data = {
            'office_id': office.id,
            'fontType_id': list(fontTypes)  # Convierte el queryset a una lista de IDs
        }
        result.append(office_data)

    return Response(result)

@api_view(['POST'])
def create_user(request):
    """Función para crear un nuevo usuario"""
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  # Crea el usuario en la base de datos
        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    # Buscar el usuario por correo
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    # Verificar la contraseña usando el método check_password
    if user.check_password(password):  # Verifica la contraseña encriptada
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        return Response({
            'refresh': str(refresh),
            'access': str(access_token)
        }, status=status.HTTP_200_OK)
    
    return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)




class BookView(APIView):

    # Función que agrega un libro
    def post(self, request):
        data = request.data
        serializer = BookSerializer(data=data)

        if serializer.is_valid():
            book = serializer.save()
                
            self.handle_font_types(book, request.data.get('fontTypes', []))
            return Response({"message": "Book Added Successfully", "id": book.id}, status=status.HTTP_201_CREATED)
        
        return Response({"message": "Failed to Add Book", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)       

    # Función que obtiene un libro
    def get_book(self, pk):
        try:
            return Book.objects.get(id=pk)
        except Book.DoesNotExist:
            raise Http404("Book not found")
        
    # Función que obtiene el listado de los libros o un libro en particular
    def get(self, request, pk=None):
        if pk:
            book = self.get_book(pk)
            serializer = BookSerializer(book)
            return Response(serializer.data)
        else:
            books = Book.objects.all()
            serializer = BookSerializer(books, many=True)
            return Response(serializer.data)

   # Función que actualiza un libro
    def put(self, request, pk):
        book = self.get_book(pk)
        request.data['id'] = pk
        font_types_data = request.data.pop('fontTypes', [])
        
        serializer = BookSerializer(book, data=request.data)
        if serializer.is_valid():
            book = serializer.save()
                
            self.handle_font_types(book, font_types_data)
        
            return Response({"message": "Book Updated Successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Failed to Update Book", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # Función que elimina un libro
    def delete(self, request, pk):
        book = self.get_book(pk)
        book.delete()
        return JsonResponse({"message": "Book Deleted Successfully"}, status=204)

    # Función auxiliar para manejar la relación many-to-many de fontTypes
    def handle_font_types(self, book, font_types_data):
        FontTypeBook.objects.filter(bookID=book).delete()
        for font_type_id in font_types_data:
            font_type = FontType.objects.get(id=font_type_id)
            FontTypeBook.objects.create(bookID=book, fontTypeID=font_type)

class OfficeView(APIView):

    # Función que agrega una oficina
    def post(self, request):
        data = request.data
        serializer = OfficeSerializer(data=data)

        if serializer.is_valid():
            office = serializer.save()
            return JsonResponse({"message": "Office Added Successfully", "id": office.id}, status=201)
        return JsonResponse({"message": "Failed to Add Office", "errors": serializer.errors}, status=400)

    # Función que obtiene una oficina
    def get_office(self, pk):
        try:
            return Office.objects.get(id=pk)
        except Office.DoesNotExist:
            raise Http404("Office not found")

    # Función que obtiene el listado de las oficinas o una oficina en particular
    def get(self, request, pk=None):
        if pk:
            office = self.get_office(pk)
            serializer = OfficeSerializer(office)
            return Response(serializer.data)
        else:
            offices = Office.objects.all()
            serializer = OfficeSerializer(offices, many=True)
            return Response(serializer.data)

    # Función que actualiza una oficina
    def put(self, request, pk):
        office = self.get_office(pk)
        request.data['id'] = pk
        serializer = OfficeSerializer(office, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({"message": "Office Updated Successfully"}, status=200)
        return JsonResponse({"message": "Failed to Update Office", "errors": serializer.errors}, status=400)

    # Función que elimina una oficina
    def delete(self, request, pk):
        office = self.get_office(pk)
        office.delete()
        return JsonResponse({"message": "Office Deleted Successfully"}, status=204)


class FontTypeView(APIView):

    # Función que agrega un tipo de fuente
    def post(self, request):
        data = request.data
        serializer = FontTypeSerializer(data=data)

        if serializer.is_valid():
            font_type = serializer.save()
            return JsonResponse({"message": "Font Type Added Successfully", "id": font_type.id}, status=201)
        return JsonResponse({"message": "Failed to Add Font Type", "errors": serializer.errors}, status=400)

    # Función que obtiene un tipo de fuente
    def get_font_type(self, pk):
        try:
            return FontType.objects.get(id=pk)
        except FontType.DoesNotExist:
            raise Http404("Font Type not found")

    # Función que obtiene el listado de los tipos de fuente o un tipo de fuente en particular
    def get(self, request, pk=None):
        if pk:
            font_type = self.get_font_type(pk)
            serializer = FontTypeSerializer(font_type)
            return Response(serializer.data)
        else:
            font_types = FontType.objects.all()
            serializer = FontTypeSerializer(font_types, many=True)
            return Response(serializer.data)

    # Función que actualiza un tipo de fuente
    def put(self, request, pk):
        font_type = self.get_font_type(pk)
        request.data['id'] = pk
        serializer = FontTypeSerializer(font_type, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse({"message": "Font Type Updated Successfully"}, status=200)
        return JsonResponse({"message": "Failed to Update Font Type", "errors": serializer.errors}, status=400)

    # Función que elimina un tipo de fuente
    def delete(self, request, pk):
        font_type = self.get_font_type(pk)
        font_type.delete()
        return JsonResponse({"message": "Font Type Deleted Successfully"}, status=204)

# Futura version

# class PersonView(APIView):

#     # Función que agrega una persona en Person
#     def post(self, request):
#         data = request.data
#         serializer = PersonSerializer(data=data)

#         if serializer.is_valid():
#             person = serializer.save()
#             return JsonResponse({"message": "Person Added Successfully", "id": person.id}, status=201)
#         return JsonResponse({"message": "Failed to Add Person", "errors": serializer.errors}, status=400)

#     # Función que obtiene una persona en Person
#     def get_person(self, pk):
#         try:
#             return Person.objects.get(id=pk)
#         except Person.DoesNotExist:
#             raise Http404("Person not found")

#     # Función que obtiene el listado de las personas o una persona en particular
#     def get(self, request, pk=None):
#         if pk:
#             person = self.get_person(pk)
#             serializer = PersonSerializer(person)
#             return Response(serializer.data)
#         else:
#             persons = Person.objects.all()
#             serializer = PersonSerializer(persons, many=True)
#             return Response(serializer.data)

#     # Función que actualiza una persona en Person
#     def put(self, request, pk):
#         person = self.get_person(pk)
#         request.data['id'] = pk
#         serializer = PersonSerializer(person, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return JsonResponse({"message": "Person Updated Successfully"}, status=200)
#         return JsonResponse({"message": "Failed to Update Person", "errors": serializer.errors}, status=400)

#     # Función que elimina una persona en Person
#     def delete(self, request, pk):
#         person = self.get_person(pk)
#         person.delete()
#         return JsonResponse({"message": "Person Deleted Successfully"}, status=204)
