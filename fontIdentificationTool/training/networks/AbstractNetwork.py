######################################################################
#Red neuronal abstracta, reusable para todos los experimentos
######################################################################
from contextlib import redirect_stdout
import training.dataTypes.TrainingSet #necesario para ejecutarlo via consola
import numpy as np, bz2, pickle
from abc import ABC, abstractmethod
from keras.callbacks import EarlyStopping, ModelCheckpoint
from keras_preprocessing.image import ImageDataGenerator

######################################################################
######################################################################
#Red neuronal abstracta, reusable para todos los experimentos
######################################################################
class AbstractNetwork(ABC):
    #atributos de la clase
    trainingSet = None;
    model = None;
    networkTemporalFile = None;
    patience = 20;
    epochs = 1000;
    imgRotationRange = 4;
    validation_split = 0.3;
    batch_size = 32;

    # constructor de la clase
    def __init__(self, trainingCollectionInputFile, networkTemporalFile, patience=20, epochs=1000, imgRotationRange=4, validation_split = 0.3, batch_size=32):
        np.random.seed(7);
        with bz2.BZ2File(trainingCollectionInputFile, 'r') as file: self.trainingSet = pickle.load(file);

        #para depurar nos quedamos con pocos datos
        #self.trainingSet.imgList = self.trainingSet.imgList[0: 100];
        #self.trainingSet.imgSizeList = self.trainingSet.imgSizeList[0: 100];
        #self.trainingSet.imgClasifListOneShot = self.trainingSet.imgClasifListOneShot[0: 100];

        filas, columnas, numOutputs = self.trainingSet.getImageSize();
        self.model = self.getNetworkModel(filas, columnas, numOutputs);
        self.networkTemporalFile = networkTemporalFile;
        self.patience = patience;
        self.epochs = epochs;
        self.imgRotationRange = imgRotationRange;
        self.validation_split = validation_split;
        self.batch_size = batch_size;

    # abstract method private that returns the model
    @abstractmethod
    def getNetworkModel(self, filas, columnas, numOutputs):
        pass

    # abstract method that trains the network
    @abstractmethod
    def trainNetwork(self):
        pass

    # evalua la red, depende de las estructura
    @abstractmethod
    def evaluateNetwork(self):
        pass

    def saveNetwork(self, mDetectorNetworkFile, mDetectorNetworkQualityReportFile):
        self.model.load_weights(self.networkTemporalFile);
        self.model.save(mDetectorNetworkFile)
        scores = self.evaluateNetwork();
        with open(mDetectorNetworkQualityReportFile, 'w') as report:
            with redirect_stdout(report):
                self.model.summary();
            report.write("\n%s: %.2f%%" % (self.model.metrics_names[1], scores[1] * 100));

######################################################################
# Red neuronal abstracta, reusable para todos los experimentos de tamaño fijo conv que tiene en cuenta el tamaño de las letras
######################################################################
class AbstractFixedConvWithSizeNetwork(AbstractNetwork):
    # entrenamiento del modelo configurado
    def trainNetwork(self):
        # preparamos el generador de los datos para realizar el entrenaminento
        datagen = ImageDataGenerator(rotation_range=self.imgRotationRange,horizontal_flip=False, fill_mode='constant', cval=1);
        datagen.fit(self.trainingSet.imgList)
        size_set = np.reshape(self.trainingSet.imgSizeList,(self.trainingSet.imgSizeList.shape[0], self.trainingSet.imgSizeList.shape[1]));
        size_set = np.concatenate((size_set, self.trainingSet.imgClasifListOneShot), axis=1) #duargamos con el tamañp, la clasificacion
        generator = datagen.flow(self.trainingSet.imgList, size_set,batch_size=len(self.trainingSet.imgList));

        # entrenamos la red, callbacs ajuste del generador, primer entrenamiento y el resto de epochs
        callbacks = [EarlyStopping(monitor='val_loss', patience=self.patience), ModelCheckpoint(filepath=self.networkTemporalFile, monitor='val_loss', save_best_only=True, save_weights_only=True)]
        self.model.fit([self.trainingSet.imgList, self.trainingSet.imgSizeList], self.trainingSet.imgClasifListOneShot,
                       validation_split=self.validation_split, batch_size=self.batch_size, epochs=1, callbacks=callbacks);
        for e in range(self.epochs):
            print('Epoch:',e);
            imgs, sizesyclasif = generator.next();
            sizes = sizesyclasif[:, 0:2];
            sizes = np.reshape(sizes,(sizes.shape[0], sizes.shape[1], 1));
            self.model.fit([imgs, sizes], sizesyclasif[:,2:], validation_split=self.validation_split, batch_size=self.batch_size, epochs=1, callbacks=callbacks);

    # evalua la red, depende de las estructura
    def evaluateNetwork(self):
        return self.model.evaluate([self.trainingSet.imgList, self.trainingSet.imgSizeList], self.trainingSet.imgClasifListOneShot, verbose=0);

######################################################################
# Red neuronal abstracta, reusable para todos los experimentos de tamaño fijo conv sin tamaño de las letras
######################################################################
class AbstractFixedConvNetwork(AbstractNetwork):
    # entrenamiento del modelo configurado
    def trainNetwork(self):
        # inicializamos semilla por replicabilidad y los parametros generales de la red
        callbacks = [EarlyStopping(monitor='loss', patience=self.patience), ModelCheckpoint(filepath=self.networkTemporalFile, monitor='loss', save_best_only=True, save_weights_only=True)]

        # entrenamos la red
        datagen = ImageDataGenerator(rotation_range=self.imgRotationRange,horizontal_flip=False, fill_mode='constant', cval=1);
        datagen.fit(self.trainingSet.imgList)
        self.model.fit_generator(datagen.flow(self.trainingSet.imgList, self.trainingSet.imgClasifListOneShot, batch_size=self.batch_size),
                       steps_per_epoch=len(self.trainingSet.imgList) / self.batch_size, epochs=self.epochs, callbacks=callbacks)

    # evalua la red, depende de las estructura
    def evaluateNetwork(self):
        return self.model.evaluate(self.trainingSet.imgList, self.trainingSet.imgClasifListOneShot, verbose=0)