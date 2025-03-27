##################################################################
#Clase con metodos para procesar una imagen
##################################################################
import cv2
import numpy as np
from PIL import Image

##################################################################
##################################################################
#Clase con metodos para procesar una imagen
##################################################################
class ImageProcessor:

    # Obtiene la resolución de la imagen TIFF o utiliza una por defecto en caso de no encontrarla.
    def get_resolution(self, image):
        ppi = 300;  # resolucion por defecto
        x_res = image.tag[0x011A];
        y_res = image.tag[0x011B];
        res_unit = image.tag[0x0128];
        if res_unit[0] == 2:  # Resolución en pulgadas
            if x_res[0][0] <= y_res[0][0]:
                ppi = x_res[0][0] / x_res[0][1];
            else:
                ppi = y_res[0][0] / y_res[0][1];
        return ppi

    # Aplica un proceso de limpieza de puntos básico (morfologia cv2) para facilitar encontrar las letras bien ajustadas
    def cleanImage(self, img):
        opencvImage = cv2.cvtColor(np.array(img.convert('RGB')), cv2.COLOR_RGB2GRAY);
        #opencvImage = cv2.morphologyEx(opencvImage, cv2.MORPH_CLOSE, np.ones((4, 4), np.uint8)); //destroza las imagenes con letra pequeña
        #opencvImage = cv2.morphologyEx(opencvImage, cv2.MORPH_OPEN, kernel);
        (thresh, opencvImage) = cv2.threshold(opencvImage, 127, 255, cv2.THRESH_BINARY); #127
        return Image.fromarray(opencvImage).convert("1");