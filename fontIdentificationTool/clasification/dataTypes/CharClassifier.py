############################################################
#clasificador de ms y tipos de ms usando las redes neuronales que se le pasan por parametro
############################################################
import bz2, pickle, keras, numpy as np, time
from PIL import Image

############################################################
############################################################
#clase que realiza la clasificación de ms y tipos de ms
############################################################
class CharClassifier:
    #constructor del clasificador
    def __init__(self, mDetectNetworkFile, mTypeDetectNetworkFile, trainingCollectionInputFile):
        self.mDetectorModel = keras.models.load_model(mDetectNetworkFile)
        self.mTypeDetectorModel = keras.models.load_model(mTypeDetectNetworkFile)
        with bz2.BZ2File(trainingCollectionInputFile, 'r') as file: self.trainingSet = pickle.load(file);

    # filtra aquellos posibles caracteres que son mucho mas grandes que lo esperado
    def __filterAnomalousSegmentations(self, charsi,charPosi, blockchari): #esto no funciona si no tiene la misma resolucion que los alfabetos
        shape = self.mDetectorModel.layers[0].input_shape;
        chars = []; blockchar = []; charPos = [];
        for char, cpos, bchar in zip(charsi,charPosi, blockchari):
            if char.height <= 1.1* shape[1] and char.width <= 1.1 * shape[2]:
                chars.append(char); blockchar.append(bchar); charPos.append(cpos);
        return chars, charPos, blockchar;

    # obtenemos los indices de todas las ms del bloque
    def getBlockMs(self, textBlocks):
        # preparamos los datos para clasificar
        chars = []; blockchar = []; charPos = []
        for idx, block in enumerate(textBlocks):
            chars.extend(block.chars);
            charPos.extend(block.charsPos)
            blockchar.extend([idx] * len(block.chars));

        #filtramos caracteres anomalos, lo hace mal deberia tener en cuenta resolucion, no solo tamaño
        #chars, charPos, blockchar = self.__filterAnomalousSegmentations(chars,charPos, blockchar)
        start_time = time.time();
        # clasificamos los caracteres en m o no m
        idxms = self.__isMs(chars)
        mchasr = [chars[i] for i in idxms]
        mblocks = [blockchar[i] for i in idxms]
        mcharPos = [charPos[i] for i in idxms]

        print("--- %s seconds m---" % (time.time() - start_time));
        start_time = time.time();
        # clasificamos las ms en su tipo si ha encontrado alguna m
        if len(mchasr)>0:
            mtypes = self.__getMTypes(mchasr)
            for i, ind in enumerate(mblocks):
                textBlocks[ind].ms.append(mchasr[i])
                textBlocks[ind].mTypes.append(mtypes[i])
                textBlocks[ind].mCharPos.append(mcharPos[i])
        print("--- %s seconds mt---" % (time.time() - start_time));
        return textBlocks, len(chars)

    # identifica si los caracteres pasados son una m o no lo son
    def __isMs(self, chars):
        #obtenemos las dimensiones de entrada de la red neuronal
        shape = self.mDetectorModel.layers[0].input_shape;

        # redimensionamos la imagen al tamaño maximo
        convchars = np.array([np.asarray(img.resize((shape[2], shape[1]), Image.ANTIALIAS)) for img in chars]).astype(np.int8);
        convchars = np.reshape(convchars,(convchars.shape[0], convchars.shape[1], convchars.shape[2], 1));

        #redimensionamos los tamaños de las imagenes entre 0 y 1
        convimgsizes =[];
        for idx, char in enumerate(chars) :
                convimgsizes.append(np.reshape(np.array([char.height / shape[1], char.width / shape[2]]), (1, 2, 1)));
        convimgsizes = np.concatenate(convimgsizes);

        #predecimos si es m o no es m cada imagen
        return np.asarray(np.where(self.mDetectorModel.predict([convchars, convimgsizes])[:,1]>0.9))[0].astype(int);

    # identifica el tipo de m del caracter (que antes se ha identificado como m
    def __getMTypes(self, chars):
        #obtenemos las dimensiones de entrada de la red neuronal
        shape = self.mTypeDetectorModel.layers[0].input_shape;

        # redimensionamos la imagen al tamaño maximo
        convchars = np.array([np.asarray(img.resize((shape[2], shape[1]), Image.ANTIALIAS)) for img in chars]).astype(np.int8);
        convchars = np.reshape(convchars, (convchars.shape[0], convchars.shape[1], convchars.shape[2], 1));

        #predecimos el tipo de m
        prediction = self.mTypeDetectorModel.predict([convchars]);
        return [self.trainingSet.mTypes.get(key) for key in prediction.argmax(axis=1)];

    '''
    def saveLogImg(self, colection, dir, cant):
        if not os.path.exists(dir): os.makedirs(dir);
        for i in range(0, cant):
            colection[i].save(dir + '/image_' + str(i) + '.png');
        print('valores distintos ' + dir + ': ', np.unique(colection));

    def saveLog(self, colection, dir, cant):
        if not os.path.exists(dir): os.makedirs(dir);
        for i in range(0, cant):
            imgv = colection[i].astype(np.bool_);
            imgv = np.reshape(imgv, (imgv.shape[0], imgv.shape[1]));
            img = Image.fromarray(imgv);
            img.save(dir + '/image_' + str(i) + '.png');
        print('valores distintos ' + dir + ': ', np.unique(colection));
    
    #identifica el tipo de m del caracter (que antes se ha identificado como m
    def getMType(self, char):
        shape = self.mDetectorModel.layers[0].input_shape
        charImg = char.resize((shape[1], shape[2]))
        numpyCharImg = np.array([image.img_to_array(charImg)])
        prediction = self.mTypeDetectorModel.predict([numpyCharImg])
        indices = np.where(prediction == prediction.max())
        alpNames= self.trainingSet.imgAlfNameList[indices]
        return alpNames;

    #identifica si el caracter pasado es una m o no lo es
    def isM(self, char):
        shape = self.mDetectorModel.layers[0].input_shape
        charImg = char.resize((shape[1], shape[2]))
        numpyCharImg = np.asarray(charImg).astype(np.int8) # forma alternativa  numpyCharImg = np.array(charImg.getdata())/255;
        numpyCharImg = np.reshape(numpyCharImg,(1,shape[1], shape[2],1))
        #char.save('../result.tiff') np.savetxt('../a.txt', numpyCharImg)
        imageSize = np.array([char.height/shape[1],char.width/shape[2]])
        imageSize = np.reshape(imageSize, (1, 2, 1))
        prediction = self.mDetectorModel.predict([numpyCharImg, imageSize])
        # si lo devuelto se parece a una m devuelve cierto
        if prediction.item(1) > 0.95: return True;
        return False;
    '''