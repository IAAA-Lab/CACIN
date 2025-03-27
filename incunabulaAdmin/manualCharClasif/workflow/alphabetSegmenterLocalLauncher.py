import os

from PIL import Image, ImageDraw
from SPARQLWrapper import SPARQLWrapper, JSON
from rdflib import Graph, URIRef

from alphabetSegmenter import getAlphabetSegmentation
from manualCharClasif.workflow import incunabulaSparqlUri, iaaa, alph

"""
Carga del punto sparql con los metadatos de las fuentes aquellas seleccionadas el nombre del fichero fuente y los segemnta
si no lo estan ya. No funcionará bien si hay varios ficheros de M para un tipo de letra dado.
"""

#Localización de los ficheros de imagenes y los resultados
sourceTwFontImagesDir = "data/input/typography-recognition-workflow/tw_fonts"
destTwFontMdDir = "data/output/typography-recognition-workflow/tw_fonts/md"
destTwFontImgDir = "data/output/typography-recognition-workflow/tw_fonts/img"

#Servicio donde esta la info de los incunables a procesar
incunabula_sparql_endpoint = SPARQLWrapper(incunabulaSparqlUri)

##############################################################################
#Funcion que busca las fuentes validas para test y su fichero de M.
##############################################################################
def search_fontFile_query(debug):
    incunabula_sparql_endpoint.setQuery("""
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX iaaa: <http://iaaa.es/incunabula#>
        SELECT ?font ?file 
        WHERE { ?font iaaa:validForTesting \"true\".
                ?font iaaa:alphabetImage ?file }
    """)
    incunabula_sparql_endpoint.setReturnFormat(JSON)
    results = incunabula_sparql_endpoint.query().convert()
    fonts = []; files = []
    for result in results["results"]["bindings"]:
        fonts.append(result["font"]["value"])
        path, file = os.path.split(result["file"]["value"])
        files.append(file)

    if(debug):
        print("Fuentes seleccionadas: ")
        for font, file in zip(fonts, files):
            print("    ", font, file)

    return zip (fonts, files)

##############################################################################
#Segmenta una imagen de alfabeto y devuelve la informacion de las posiciones de las letras como un rdf
##############################################################################
def segmentCharactersAndSaveAsRDF(fontInfo, destMdDir, sourceTwFontImagesDir):
    for font, file in fontInfo:
        image = Image.open(sourceTwFontImagesDir + "/" + file)
        rdfText = getAlphabetSegmentation(image, file)
        fuente = URIRef(alph + file)
        g = Graph()
        g.parse(data=rdfText, format='turtle')
        g.add((fuente, iaaa.font, URIRef(font)))
        g.serialize(destination=destMdDir+"/"+os.path.splitext(file)[0] + ".rdf", format='turtle')

##############################################################################
#Genera imagenes de alfabetos con los caracteres marcados, adecuadamente segmentados
##############################################################################
def saveFontSegmentationImages(mdDir, imgdDir, imgsDir):
    for rdffile in os.listdir(mdDir):
        # cargamos la imagen
        imgName = os.path.splitext(rdffile)[0] + ".tif"
        imgNameD = os.path.splitext(rdffile)[0] + ".jpg"
        image = Image.open(imgsDir+"/"+imgName)
        draw_image = image.convert("RGB")
        drw = ImageDraw.Draw(draw_image)

        # sacamos la info del rdf  y pintamos los rectangulos
        g = Graph()
        g.load(mdDir+"/"+rdffile, format='turtle')
        for s, p, o in g.triples((None, iaaa.character, None)):
            xpos = int(g.value(o, iaaa.xPos))
            ypos = int(g.value(o, iaaa.yPos))
            width = int(g.value(o, iaaa.width))
            height = int(g.value(o, iaaa.height))
            color = (0, 255, 0)
            if not bool(g.value(o, iaaa.valid)):
                color = (255, 0, 0)
            drw.rectangle(((xpos, ypos), (xpos + width, ypos + height)), outline=color,width=5)
        draw_image.save(imgdDir+"/"+imgNameD)

"""
##############################################################################
#programa principal que hace las segmentacion de los ficheros de entrenamiento
##############################################################################
"""
debug = False
if __name__ == "__main__":
    #nos movemos al directirio de trabajo adecuado
    os.chdir("../../..")
    print("Directorio de trabajo:", os.getcwd())

    #nos aseguramos que los directorios necesarios existen
    if not os.path.exists(destTwFontMdDir): os.makedirs(destTwFontMdDir)
    if not os.path.exists(destTwFontImgDir): os.makedirs(destTwFontImgDir)

    #filtramos las imagenes de las fuentes que nos iteresan
    print("-- Seleccionando fuentes a procesar")
    fontInfo = search_fontFile_query(debug)

    #las segmentamos generando un fichero de rdf con la segmentacion
    print("-- Segmentando fuentes en caracteres")
    segmentCharactersAndSaveAsRDF(fontInfo, destTwFontMdDir, sourceTwFontImagesDir)

    #para facilitar la visualizacion creamos las imagenes con la segmentacion en un directorio
    print("-- Generando imagenes de la segmentación")
    saveFontSegmentationImages(destTwFontMdDir, destTwFontImgDir, sourceTwFontImagesDir)

"""
#borramos del registro a procesar aquellas fuentes que ya tienen metadatos
#no queremos que se sobreescriba, ya que implican trabajo manual (si hay que borrarlos, a mano)
def ignore_files_with_existent_metadata(fontInfo, debug, destTwFontMdDir):
    fonts = []; files = []
    for font, file in fontInfo:
        # si ya hay metadatos, ignoramos la imagen. ("No queremos machacarlos, si hay que borrar algo a mano")
        rdfName = os.path.splitext(file)[0] + ".rdf"
        if not os.path.isfile(os.path.join(destTwFontMdDir, rdfName)):
            fonts.append(font)
            files.append(file)
        elif debug:
            print("Metadatos ya existentes para la imagen de tipo de fuente:", file)

    return zip(fonts,files)
"""

"""
#Muestra una imagen de opencv (No usada)
def showOpenCvImage (image):
    cv2.imshow('image', image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
"""