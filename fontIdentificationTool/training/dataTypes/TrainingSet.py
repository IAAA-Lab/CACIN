########################################################
# clase para almacenar la colección de entrenamiento y generar el fichero que suaran las redes
########################################################
import os

import numpy as np
from enum import Enum
from keras_preprocessing.image import ImageDataGenerator
from sklearn.utils import shuffle
from PIL import Image

########################################################
# clase para almacenar la colección de entrenamiento
# lista de imagenes, sus tanñaós originales, su clasificacion, m o no m, y el nombre del alfabeto en el que estan
########################################################
class TrainingSet:
    MODE = Enum('MODE', 'CHAR CHARTYPE');  # el modo es para indicar si la coleccion esta clasificada por caracter o por tipo de caracter
    SET = Enum('SET', 'M NonM ALL');  # El tipo indica que subconjuto de la coleccion queremos obtener en el metodo de

    # constructor de la clase
    def __init__(self, imgList, imgSizeList, imgClasifList, imgAlfNameList):
        self.imgList = imgList;
        self.imgSizeList = imgSizeList;
        self.imgClasifList = imgClasifList;
        self.imgAlfNameList = imgAlfNameList;

    # normaliza los vectores y los deja preparados para el entrenamiento
    def normalizeDataCollection(self,divide=False):
        #normalizamoe el tamaño de la imagen entre 0 y 1
        self.maxDimFinal = self.maxDim = np.amax(self.imgSizeList, 0);
        if(divide): self.maxDimFinal = np.floor_divide(self.maxDim, (2,2))
        self.imgSizeList = self.imgSizeList / self.maxDim;
        self.imgSizeList = np.reshape(self.imgSizeList, (self.imgSizeList.shape[0], self.imgSizeList.shape[1], 1));
        #redimensionamos la imagen al tamaño maximo
        self.imgList = np.array([np.asarray(img.resize(self.maxDimFinal, Image.ANTIALIAS)) for img in self.imgList]).astype(np.int8);
        self.imgList = np.reshape(self.imgList, (self.imgList.shape[0], self.imgList.shape[1], self.imgList.shape[2], 1));
        #val = np.unique(self.imgList)

    #carga los ficheros de caracteres mal segmentados que parecen ms
    def loadAnomalouslySegmentedChars(self,dir):
        imgList=[]; imgSizeList= np.empty(shape=[0, 2],dtype=np.int32) ;
        #cargamos los ficheros de caracteres erroneos
        filesToProcess = os.listdir(dir);
        for fileName in filesToProcess:
            file_image = Image.open(dir+'/'+fileName);
            width, height = file_image.size;
            imgList.append(file_image);
            imgSizeList = np.append(imgSizeList, np.array([[width, height]]), axis=0);
            self.imgAlfNameList.append('None')
        #normalizamos el tamaño de forma que los maximos sean respecto de la coleccion buena
        imgSizeList = imgSizeList / self.maxDim;
        imgSizeList = np.reshape(imgSizeList, (imgSizeList.shape[0], imgSizeList.shape[1], 1));
        #normalizamos las imagenes respecto del tamaño general
        imgList = np.array([np.asarray(img.resize(self.maxDimFinal, Image.ANTIALIAS)) for img in imgList]).astype(np.int8);
        imgList = np.reshape(imgList,(imgList.shape[0], imgList.shape[1], imgList.shape[2], 1));
        #creamos la clasificacion, todas no ms
        imgClasifList = np.zeros(len(filesToProcess),dtype=np.int32)
        #juntamos los nuevos caracteres con los antiguos
        self.imgList = np.append(self.imgList,imgList,axis=0)
        self.imgSizeList = np.append(self.imgSizeList, imgSizeList, axis=0)
        self.imgClasifList = np.append(self.imgClasifList, imgClasifList)
        # val = np.unique(self.imgList)

    # crea la clasificacion en estilo one shot. 2 modos. o por el valor de clasificación (m o no m) o por valores diferentes en nombres de alfabetos (tipo de m)
    def createOneShotClasification(self, mode):
        if mode == self.MODE.CHAR:
            self.imgClasifListOneShot = np.zeros((len(self.imgClasifList), max(self.imgClasifList) + 1));
            self.imgClasifListOneShot[np.arange(len(self.imgClasifList)), self.imgClasifList] = 1;
        else:
            imgClasifList = [];
            distAlp = dict();
            i = 0;
            for (clasif, alfName) in zip(self.imgClasifList, self.mShapes):
                if alfName in distAlp.keys():
                    imgClasifList.append(distAlp[alfName]);
                else:
                    distAlp[alfName] = i;
                    imgClasifList.append(i);
                    i = i + 1;
            self.mTypes = {v: k for k, v in distAlp.items()} #nos guardamos a que tipo de m corresponde cada clasificacion
            self.imgClasifListOneShot = np.zeros((len(imgClasifList), max(imgClasifList) + 1));
            self.imgClasifListOneShot[np.arange(len(imgClasifList)),imgClasifList] = 1;

    # devuelve una nueva colección con los elementos de la letra elegida, con el modo a falso devuelve los contrarios
    def getCollectionByType(self, colType):
        imgList = []; imgSizeList = np.empty(shape=[0, 2], dtype=np.int32); imgClasifList = np.empty(shape=[0],dtype=np.int32); imgAlfNameList = [];
        for (img, size, clasif, alfName) in zip(self.imgList, self.imgSizeList, self.imgClasifList, self.imgAlfNameList):
            if (colType == TrainingSet.SET.M and clasif == 1) or (colType == TrainingSet.SET.NonM and clasif == 0) or colType == TrainingSet.SET.ALL:
                imgList.append(img);
                imgSizeList = np.append(imgSizeList,[size], axis=0);
                imgClasifList = np.append(imgClasifList,clasif);
                imgAlfNameList.append(alfName);
        collection = TrainingSet(imgList, imgSizeList, imgClasifList, imgAlfNameList);
        return collection;

    # multiplica los ejemplos de entrenamiento
    def multiplySamples(self, veces, imgRotationRange, colType):
        imgList = []; imgSizeList =[]; imgClasifList =[]; imgClasifListOneShot =[]; imgAlfNameList = [] #es mas rapido concatenar listas que numpis
        datagen = ImageDataGenerator(rotation_range=imgRotationRange, horizontal_flip=False, fill_mode='constant', cval=1);
        for img, imgSize, imgClasif, imgClasifOH, imgAlf in zip(self.imgList, self.imgSizeList, self.imgClasifList, self.imgClasifListOneShot, self.imgAlfNameList):
            if (colType == TrainingSet.SET.M and imgClasif == 1) or (colType == TrainingSet.SET.NonM and imgClasif == 0) or colType == TrainingSet.SET.ALL:
                generator = datagen.flow(np.array([img]));
                for j in range(0, veces):
                    imgList.append(np.rint(generator.next()).astype(np.int8))
                    imgSizeList.append([imgSize])
                    imgClasifList.append([imgClasif])
                    imgClasifListOneShot.append([imgClasifOH])
                    imgAlfNameList.append(imgAlf);
        self.imgList = np.concatenate((self.imgList, np.concatenate(imgList, axis=0)),axis=0)
        self.imgSizeList = np.concatenate((self.imgSizeList, np.concatenate(imgSizeList, axis=0)),axis=0)
        self.imgClasifList = np.concatenate((self.imgClasifList, np.concatenate(imgClasifList, axis=0)),axis=0)
        self.imgClasifListOneShot = np.concatenate((self.imgClasifListOneShot, np.concatenate(imgClasifListOneShot, axis=0)),axis=0)
        self.imgAlfNameList = self.imgAlfNameList + imgAlfNameList;

    # reordena la dolección aleatorizando el contenido, tambien la deja como arrays numpy en vez de listas
    # hay que generar primero el vector de one shot para que reorganite tambien el vector.
    def randomizeCollection(self):
        [self.imgList, self.imgSizeList, self.imgClasifList, self.imgClasifListOneShot,
         self.imgAlfNameList] = shuffle(self.imgList, self.imgSizeList, self.imgClasifList, self.imgClasifListOneShot, self.imgAlfNameList, random_state=0);

    # devuelve las dimensiones de las imagenes, se tiene que llamar despues de randomizar para que sean vectores numpy
    def getImageSize(self):
        return self.imgList.shape[1], self.imgList.shape[2], self.imgClasifListOneShot.shape[1];