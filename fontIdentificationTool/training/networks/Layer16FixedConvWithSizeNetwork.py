# training/networks/Layer16FixedConvWithSizeNetwork.py
from keras.layers import Input, Flatten, Dense, concatenate, Dropout, Lambda
from keras.applications import VGG16
from keras.models import Model
from keras import optimizers
from keras import backend as K

from training.networks.AbstractNetwork import AbstractFixedConvWithSizeNetwork

class Layer16FixedConvWithSizeNetwork(AbstractFixedConvWithSizeNetwork):

    def getNetworkModel(self, filas, columnas, numOutputs):
        # Input layer with 1 channel
        inputs1 = Input(shape=(filas, columnas, 1))
        
        # Repeat the single channel to 3 channels
        x = Lambda(lambda x: K.repeat_elements(x, 3, axis=-1))(inputs1)
        
        # VGG16 base model
        base_model = VGG16(weights='imagenet', include_top=False, input_shape=(filas, columnas, 3))
        for layer in base_model.layers:
            layer.trainable = False  # Freeze VGG16 layers
        
        # Apply the base model to the input
        x = base_model(x)
        
        # Additional custom layers after VGG16
        x = Flatten()(x)
        
        # Additional input for size information
        inputs2 = Input(shape=(2, 1))
        flat2 = Flatten()(inputs2)
        
        # Concatenate flattened VGG16 output with size information
        merged = concatenate([x, flat2])
        d1 = Dense(512, activation='relu')(merged)
        d1 = Dropout(0.5)(d1)  # Adding dropout for regularization
        d2 = Dense(512, activation='relu')(d1)
        d2 = Dropout(0.5)(d2)
        output = Dense(numOutputs, activation='softmax')(d2)
        
        # Create the model
        model = Model(inputs=[inputs1, inputs2], outputs=output)
        
        # Compile the model
        opt = optimizers.Adam(lr=0.001)  # Using Adam optimizer
        model.compile(loss='categorical_crossentropy', optimizer=opt, metrics=['accuracy'])
        
        return model
