from keras.layers import Input, Flatten, Dense, Lambda
from keras.models import Model
from keras import optimizers
from keras.applications import VGG16
from keras import backend as K

from training.networks.AbstractNetwork import AbstractFixedConvNetwork

class Layer16FixedConvNetwork(AbstractFixedConvNetwork):
    def getNetworkModel(self, filas, columnas, numOutputs):
        # Input layer with 1 channel
        inputs1 = Input(shape=(filas, columnas, 1))

        # Repeat the single channel to 3 channels to match VGG16 input format
        x = Lambda(lambda x: K.repeat_elements(x, 3, axis=-1))(inputs1)

        # VGG16 base model without top layers (fully connected layers)
        base_model = VGG16(weights='imagenet', include_top=False, input_tensor=x)

        # Freeze VGG16 layers
        for layer in base_model.layers:
            layer.trainable = False

        # Custom layers on top of VGG16
        x = base_model.output
        x = Flatten()(x)

        # Dense layers
        d1 = Dense(2816, activation='relu')(x)
        d2 = Dense(2816, activation='relu')(d1)
        output = Dense(numOutputs, activation='softmax')(d2)

        # Create model
        model = Model(inputs=inputs1, outputs=output)

        # Compile model
        opt = optimizers.SGD(lr=0.01)
        model.compile(loss='categorical_crossentropy', optimizer=opt, metrics=['accuracy'])

        return model
