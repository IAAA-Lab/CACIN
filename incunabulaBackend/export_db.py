import sys
import rdflib
import os
import django
from django.db import models
from rdflib import Graph, URIRef, Literal, Namespace
from rdflib.namespace import RDF, DCTERMS

sys.path.append('/home/hala/work/dec/reconocimiento-tipografias-incunabula2.0/incunabula/incunabulaBackend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'incunabulaBackend.settings')
django.setup()

from incunabula.models import FontType, FontTypeBook, Office, Book

# URIs como constantes
DCT = Namespace("http://purl.org/dc/terms/")
RDF_NS = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
IAAA = Namespace("http://iaaa.es/incunabula#")

# Crear un grafo RDF
g = Graph()
g.bind("dct", DCT)
g.bind("iaaa", IAAA)

# Exportar las instancias de Office
print("Exportando instancias de Office...")
for office in Office.objects.all():
    subject = URIRef(f"http://tw.staatsbibliothek-berlin.de/{office.id}")
    g.add((subject, RDF_NS.type, URIRef(IAAA + "Office")))
    if office.officeName:
        g.add((subject, URIRef(IAAA + "officeName"), Literal(office.officeName)))
    if office.alternativeName:
        g.add((subject, URIRef(IAAA + "alternativeName"), Literal(office.alternativeName)))
    if office.location:
        g.add((subject, DCT.spatial, Literal(office.location)))
    if office.foundedYear or office.closedYear:
        temporal_str = f"start={office.foundedYear or ''} end={office.closedYear or ''}"
        g.add((subject, DCT.temporal, Literal(temporal_str)))

# Exportar las instancias de FontType
print("Exportando instancias de FontType...")
for font_type in FontType.objects.all():
    subject = URIRef(f"http://tw.staatsbibliothek-berlin.de/{font_type.id}")
    g.add((subject, RDF_NS.type, URIRef(IAAA + "FontType")))
    g.add((subject, DCT.identifier, Literal(font_type.id)))
    if font_type.height:
        g.add((subject, URIRef(IAAA + "height"), Literal(font_type.height)))
    if font_type.mShape:
        g.add((subject, URIRef(IAAA + "shape"), Literal(font_type.mShape)))
    if font_type.alphabetImage:
        g.add((subject, URIRef(IAAA + "alphabetImage"), Literal(font_type.alphabetImage)))
    if font_type.officeID:
        g.add((subject, URIRef(IAAA + "office"), URIRef(f"http://tw.staatsbibliothek-berlin.de/{font_type.officeID.id}")))

# Exportar las instancias de Book
print("Exportando instancias de Book...")
for book in Book.objects.all():
    subject = URIRef(f"http://zaguan.unizar.es/record/{book.id}")
    g.add((subject, RDF_NS.type, URIRef(IAAA + "Book")))
    g.add((subject, DCT.identifier, Literal(book.id)))
    if book.title:
        g.add((subject, DCT.title, Literal(book.title)))
    if book.creator:
        g.add((subject, DCT.creator, Literal(book.creator)))
    if book.publisher:
        g.add((subject, DCT.publisher, Literal(book.publisher)))
    if book.location:
        g.add((subject, DCT.spatial, Literal(book.location)))
    if book.file:
        g.add((subject, URIRef(IAAA + "file"), URIRef(book.file)))
    if book.printingOffice:
        g.add((subject, URIRef(IAAA + "office"), URIRef(f"http://tw.staatsbibliothek-berlin.de/{book.printingOffice.id}")))

# Guardar el grafo en un archivo RDF
output_file = "exported_data.rdf"
with open(output_file, "wb") as f:
    f.write(g.serialize(format="xml"))

print(f"Exportación completa. Los datos se han guardado en {output_file}")
