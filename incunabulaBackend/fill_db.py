import argparse
import sys
import rdflib
import psycopg2
import os
import django
from decouple import config
from django.db import IntegrityError

sys.path.append('/home/hala/work/dec/reconocimiento-tipografias-incunabula2.0/incunabula/incunabulaBackend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'incunabulaBackend.settings')
django.setup()

from incunabula.models import FontType, FontTypeBook, Office, Book

# Configuración de la conexión a la base de datos
DB_HOST = config('DB_HOST')        
DB_NAME = config('DB_NAME')
DB_USER = config('DB_USER')
DB_PASSWORD = config('DB_PASSWORD')

# URIs como constantes
DCT="http://purl.org/dc/terms/"
RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
IAAA="http://iaaa.es/incunabula#"

def convert_to_integer(value):
    try:
        number = ''.join(filter(str.isdigit, value))
        return int(number) if number else None
    except (ValueError, TypeError):
        return None
    
def truncate_string(value, max_length):
    return value[:max_length] if value else None

# Conexión a la base de datos
conn = psycopg2.connect(host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)
cursor = conn.cursor()

# Cargar y parsear el archivo RDF
parser = argparse.ArgumentParser(description="RDF to Database Importer")
parser.add_argument('rdf_file', type=str, help='Ruta al fichero RDF')
args = parser.parse_args()
g = rdflib.Graph()
g.parse(args.rdf_file, format="xml")

print("Procesando instancias de Office...")
for subject in g.subjects(rdflib.RDF.type, rdflib.URIRef(IAAA + "Office")):
    # Obtener los datos del Office
    officeName = g.value(subject, rdflib.URIRef(IAAA + "officeName"))
    alternativeName = g.value(subject, rdflib.URIRef(IAAA + "alternativeName"))
    location = g.value(subject, rdflib.URIRef(DCT + "spatial"))
    temporal = g.value(subject, rdflib.URIRef(DCT + "temporal"))

    # Extraer foundedYear y closedYear de temporal 
    foundedYear, closedYear = None, None
    if temporal:
        temporal_str = str(temporal)
        temporal_parts = temporal_str.split()
        for part in temporal_parts:
            if part.startswith("start="):
                foundedYear = part.split("=")[-1]
            elif part.startswith("end="):
                closedYear = part.split("=")[-1]

    foundedYear = convert_to_integer(foundedYear)
    closedYear = convert_to_integer(closedYear)

    #Extraer el ID de la URI
    office_id = str(subject).split("/")[-1] 

    # Insertar en la tabla incunabula_office si existe al menos el officeName
    if office_id:
        office, created = Office.objects.update_or_create(
            id=office_id,
            defaults={
                'officeName': officeName,
                'alternativeName': alternativeName if alternativeName else None,
                'location': location if location else None,
                'foundedYear': foundedYear if foundedYear else None,
                'closedYear': closedYear if closedYear else None
            }
        )
    
print("Procesando instancias de FontType...")
for subject in g.subjects(rdflib.RDF.type, rdflib.URIRef(IAAA + "FontType")):
    # Obtener los datos del FontType
    id = g.value(subject, rdflib.URIRef(DCT + "identifier"))
    height = g.value(subject, rdflib.URIRef(IAAA + "height"))
    shape = g.value(subject, rdflib.URIRef(IAAA + "shape"))
    alphabetImage = g.value(subject, rdflib.URIRef(IAAA + "alphabetImage"))
    office_uri = g.value(subject, rdflib.URIRef(IAAA + "office"))
    book_uri = g.value(subject, rdflib.URIRef(IAAA + "record"))

    # Convertir height a entero si es posible
    height = convert_to_integer(height)

    # Extraer el ID de la URI
    id_book = str(book_uri).split("/")[-1] if book_uri else None
    office_id = str(office_uri).split("/")[-1] if office_uri else None
    alphabetImage = str(alphabetImage).split("/")[-1] if alphabetImage else None

    # Verificar si el office_id es válido
    if office_id:
        try:
            # Busca la instancia de la oficina asociada
            office_instance = Office.objects.get(id=office_id)
        except Office.DoesNotExist:
            print(f"La oficina con ID '{office_id}' no existe.")
            continue

    # Verificar que el identifier sea válido
    if id:
        # Crear o actualizar el registro de FontType en Django
        font_type, created = FontType.objects.update_or_create(
            id=str(id),
            defaults={
                'height': height if height is not None else 0,
                'mShape': str(shape) if shape else '',
                'officeID': office_instance,
                'alphabetImage': alphabetImage if alphabetImage else None
            }
        )
        
    # Crear o actualizar el registro de FontTypeBook en Django
    if id_book:
        book_instance, _ = Book.objects.update_or_create(
            id=id_book,
            defaults={
                'printingOffice': office_instance
            }
        )
        
        try:
            # Crear o actualizar el registro en FontTypeBook
            fontTypeBook, created = FontTypeBook.objects.update_or_create(
                fontTypeID=font_type,
                bookID=book_instance
            )
        except IntegrityError:
            print("Error al guardar el registro: posible duplicado.")
            
print("Procesando instancias de Book...")
for subject in g.subjects(rdflib.RDF.type, rdflib.URIRef(IAAA + "Book")):
    # Obtener los datos del Book
    id = g.value(subject, rdflib.URIRef(DCT + "identifier"))
    title = g.value(subject, rdflib.URIRef(DCT + "title"))
    creator = g.value(subject, rdflib.URIRef(DCT + "creator"))
    publisher = g.value(subject, rdflib.URIRef(DCT + "publisher"))
    location = g.value(subject, rdflib.URIRef(DCT + "spatial"))
    file = g.value(subject, rdflib.URIRef(IAAA + "file"))

    # Extraer el ID de la URI
    id_book = str(id).split("/")[-1] if id else None

    office_instance = None

    # Encontrar el FontType asociada al Book
    font_type_subjects = g.subjects(rdflib.RDF.type, rdflib.URIRef(IAAA + "FontType"))
    for font_type_subject in font_type_subjects:
        id_bookFont_uri = g.value(font_type_subject, rdflib.URIRef(IAAA + "record"))
        id_bookFont = str(id_bookFont_uri).split("/")[-1] if id_bookFont_uri else None

        if id_bookFont == id_book:
            office_uri = g.value(font_type_subject, rdflib.URIRef(IAAA + "office"))
            office_id = str(office_uri).split("/")[-1] if office_uri else None 
            
            if office_id:
                try:
                    # Find the associated office instance
                    office_instance = Office.objects.get(id=office_id)
                except Office.DoesNotExist:
                    print(f"La oficina con ID '{office_id}' no existe.")
                    office_instance = None 
                    continue  

    # Guardar el archivo PDF si existe
    if file.endswith('.pdf'):
        # Check if the file URL starts with 'http://'
        if file.startswith('http://'):
            file = file.replace('http://', 'https://')
    else:
        file = None

    if id:
        # Truncar los valores de los campos de texto si exceden la longitud máxima
        truncated_title = truncate_string(str(title) if title else None, 255)
        truncated_creator = truncate_string(str(creator) if creator else None, 250)
        truncated_publisher = truncate_string(str(publisher) if publisher else None, 250)
        truncated_location = truncate_string(str(location) if location else None, 250)

        # Insertar o actualizar el registro de Book en Django
        book, created = Book.objects.update_or_create(
            id = id,
            defaults={
                'title': truncated_title,
                'creator': truncated_creator,
                'publisher': truncated_publisher,
                'location': truncated_location,
                'file': file,
                'printingOffice': office_instance
            }
        )


# Confirmar cambios y cerrar la conexión
conn.commit()
cursor.close()
conn.close()
      
        
