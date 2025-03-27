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
class Layer2FixedConvWithSizeNetwork(AbstractFixedConvWithSizeNetwork):
    #metodo que devuelve el modelo
    def getNetworkModel(self, filas, columnas, numOutputs):
        # modelo para la imagen
        inputs1 = Input(shape=(filas, columnas, 1));
        c23 = Conv2D(22, (3, 3), padding='same', activation='relu')(inputs1);
        c24 = Conv2D(22, (3, 3), padding='same', activation='relu')(c23);
        mpoll2 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2))(c24);
        c211 = Conv2D(44, (3, 3), padding='same', activation='relu')(mpoll2);
        c212 = Conv2D(44, (3, 3), padding='same', activation='relu')(c211);
        c213 = Conv2D(44, (3, 3), padding='same', activation='relu')(c212);
        mpoll5 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2))(c213);
        flat1 = Flatten()(mpoll5);

        # modelo para el tamaño
        inputs2 = Input(shape=(2, 1));
        flat2 = Flatten()(inputs2);

        # concatenamos los dos modelos y los mezclamos con un par de densas
        merged = concatenate([flat1, flat2]);
        d1 = Dense(88, activation='relu')(merged);
        d2 = Dense(88, activation='relu')(d1);
        output = Dense(numOutputs, activation='softmax')(d2);

        # construimos el modelo
        model = Model(inputs=[inputs1, inputs2], outputs=output);
        opt = optimizers.SGD(lr=0.01);
        model.compile(loss="categorical_crossentropy", optimizer=opt, metrics=['accuracy']);
        return model;