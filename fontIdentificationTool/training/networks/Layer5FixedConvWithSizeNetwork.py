######################################################################
#Red neuronal de 5 capas que no tiene en cuenta el tamaño de las letras
######################################################################
from keras import Input, Model, optimizers
from keras.layers import Conv2D, MaxPooling2D, Flatten, concatenate, Dense
from training.networks.AbstractNetwork import AbstractFixedConvWithSizeNetwork

######################################################################
######################################################################
#Red neuronal de 5 capas que tiene en cuenta el tamaño
######################################################################
class Layer5FixedConvWithSizeNetwork(AbstractFixedConvWithSizeNetwork):
    #metodo que devuelve el modelo
    def getNetworkModel(self, filas, columnas, numOutputs):
        # modelo para la imagen
        inputs1 = Input(shape=(filas, columnas, 1));
        c21 = Conv2D(22, (3, 3), padding='same', activation='relu')(inputs1);
        c22 = Conv2D(22, (3, 3), padding='same', activation='relu')(c21);
        mpoll1 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2))(c22);
        c23 = Conv2D(44, (3, 3), padding='same', activation='relu')(mpoll1);
        c24 = Conv2D(44, (3, 3), padding='same', activation='relu')(c23);
        mpoll2 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2))(c24);
        c25 = Conv2D(88, (3, 3), padding='same', activation='relu')(mpoll2);
        c26 = Conv2D(88, (3, 3), padding='same', activation='relu')(c25);
        c27 = Conv2D(88, (3, 3), padding='same', activation='relu')(c26);
        mpoll3 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2))(c27);
        c28 = Conv2D(176, (3, 3), padding='same', activation='relu')(mpoll3);
        c29 = Conv2D(176, (3, 3), padding='same', activation='relu')(c28);
        c210 = Conv2D(176, (3, 3), padding='same', activation='relu')(c29);
        mpoll4 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2))(c210);
        c211 = Conv2D(352, (3, 3), padding='same', activation='relu')(mpoll4);
        c212 = Conv2D(352, (3, 3), padding='same', activation='relu')(c211);
        c213 = Conv2D(352, (3, 3), padding='same', activation='relu')(c212);
        mpoll5 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2))(c213);
        flat1 = Flatten()(mpoll5);

        # modelo para el tamaño
        inputs2 = Input(shape=(2, 1));
        flat2 = Flatten()(inputs2);

        # concatenamos los dos modelos y los mezclamos con un par de densas
        merged = concatenate([flat1, flat2]);
        d1 = Dense(2816, activation='relu')(merged);
        d2 = Dense(2816, activation='relu')(d1);
        output = Dense(numOutputs, activation='softmax')(d2);

        # construimos el modelo
        model = Model(inputs=[inputs1, inputs2], outputs=output);
        opt = optimizers.SGD(lr=0.01);
        model.compile(loss="categorical_crossentropy", optimizer=opt, metrics=['accuracy']);
        return model;