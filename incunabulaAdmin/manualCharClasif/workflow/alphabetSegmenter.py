import cv2
import numpy as np
from PIL import Image
from rdflib import Graph, BNode
from rdflib.term import Literal, URIRef
from tesserocr import PyTessBaseAPI, RIL, PSM

from manualCharClasif.workflow import iaaa, alph


#######################################################################################
#Obtiene los caracteres dentro de los ficheros de tipos a procesar y guarda la segmentación en ficharo
#######################################################################################
def getAlphabetSegmentation(image, fontFile):
    with PyTessBaseAPI() as api:
        # limpiamos la imagen
        width, height = image.size
        image = cleanImage(image.crop((0, 0, width - 250, height - 250)))

        # la segmentamos y extraemos los rectangulos de la estructura generada por tesseract
        api.SetPageSegMode(PSM.SPARSE_TEXT)
        api.SetImage(image)
        chars = api.GetComponentImages(RIL.SYMBOL, True)
        rectangulos = []
        for i, (_, box, _, _) in enumerate(chars):
            rectangulos.append(box)

        # mezclamos los bounding bounding box cercanos ya que deberían corresponder con la misma letra
        rectangulos = mergeBoundingBoxes(rectangulos)

        # generamos los metadatos de los bounding boxes
        g = Graph()
        fuente = URIRef(alph+fontFile)
        for box in rectangulos:
            anode = BNode()
            g.add((fuente, iaaa.character, anode))
            g.add((fuente, iaaa.automaticalyGenerated, Literal("True")))
            g.add((anode, iaaa.xPos, Literal(box['x'])))
            g.add((anode, iaaa.yPos, Literal(box['y'])))
            g.add((anode, iaaa.width, Literal(box['w'])))
            g.add((anode, iaaa.height, Literal(box['h'])))
            #g.add((anode, iaaa.valid, Literal("True")))
        return g.serialize(format='turtle').decode('utf-8')

#######################################################################################
#Juntamos rectangulos que estén muy juntos porque pertenecen a la misma letra (no termina de funcionar bien)
#######################################################################################
def mergeBoundingBoxes (rectangulos):
    marginX =10
    i = 0
    cleanRect = []
    mergedLast = False
    while i < len(rectangulos)-2:
        box1 = rectangulos[i]
        box2 = rectangulos[i+1]
        mergedLast = False
        if box1['x']<box2['x'] and box1['x']+box1['w']+marginX>box2['x']:
            mergedLast = True
            box1['w']= box2['w']+ box2['x']-box1['x']
            if box1['y']>box2['y']:
                box1['h'] = box1['h']+ box1['y']-box2['y']
            else:
                box1['h'] = box2['h'] + box2['y'] - box1['y']
            box1['y'] = min(box1['y'], box2['y'])
            i += 1
            box2 = rectangulos[i + 1]
            if box1['x'] < box2['x'] < box1['x']+box1['w']+marginX:
                box1['w']= box2['w']+ box2['x']-box1['x']
                if box1['y']>box2['y']:
                    box1['h'] = box1['h']+ box1['y']-box2['y']
                else:
                    box1['h'] = box2['h'] + box2['y'] - box1['y']
                box1['y'] = min(box1['y'], box2['y'])
                i += 1
        cleanRect.append(box1)
        i += 1
    if not  mergedLast:
        cleanRect.append(rectangulos[len(rectangulos)-1])
    return cleanRect

#######################################################################################
#Aplica un proceso de limpieza de puntos básico (morfologia cv2) para facilitar encontrar las letras bien ajustadas
#######################################################################################
def cleanImage(img):
    opencvImage = cv2.cvtColor(np.array(img.convert('RGB')), cv2.COLOR_RGB2BGR)
    #quitamos puntos negros fuera de las imagenes
    opencvImage = cv2.morphologyEx(opencvImage, cv2.MORPH_CLOSE, np.ones((4, 4), np.uint8))
    #quitamos puntos blancos dentro de la imagen
    # opencvImage = cv2.morphologyEx(opencvImage, cv2.MORPH_OPEN, kernel)
    return Image.fromarray(cv2.cvtColor(opencvImage, cv2.COLOR_BGR2RGB))

#######################################################################################
#Limpieza de imagen con otro algoritmo distinto (no usado) (componentes conectados)
#######################################################################################
def cleanImageV2(img):
    opencvImage = cv2.cvtColor(np.array(img.convert('RGB')), cv2.COLOR_BGR2GRAY)
    _, blackAndWhite = cv2.threshold(opencvImage, 127, 255, cv2.THRESH_BINARY_INV)
    nlabels, labels, stats, centroids = cv2.connectedComponentsWithStats(blackAndWhite, None, None, None, 8, cv2.CV_32S)
    sizes = stats[1:, -1]  # get CC_STAT_AREA component
    img2 = np.zeros(labels.shape, np.uint8)
    for i in range(0, nlabels - 1):
        if sizes[i] >= 50:  # filter small dotted regions
            img2[labels == i + 1] = 255
    return Image.fromarray(cv2.cvtColor(cv2.bitwise_not(img2), cv2.COLOR_BGR2RGB))