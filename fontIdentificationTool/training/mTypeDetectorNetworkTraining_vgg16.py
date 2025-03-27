############################################################
# Programa de entrenamiento de la red neuronal de detección de Ms
############################################################
import os
import sys
sys.path.append('..')
sys.path.append('../training/dataTypes')
sys.path.append('../training/networks')
import training
from training.networks.Layer16FixedConvNetwork import Layer16FixedConvNetwork  # Change import here

############################################################
# Parámetros de entrenamiento de la red neuronal
############################################################
type = 'vgg16'
patience = 200
epochs = 1000
imgRotationRange = 4

############################################################
# Configuración del directorio de trabajo y ficheros de entrada y salida
############################################################
workingDir = '../'  # Para que se ejecute en la máquina remota el directorio debe ser '../' y no cualquier otro
traiCollectionMTypeDetectorOutputFile = training.traiCollectionMTypeDetectorOutputFile
filepattern = type + '_' + str(epochs) + '_' + str(patience) + '_' + str(imgRotationRange) + '_'
mDetectorNetworkTemporalFile = 'fontIdentificationTool/data/tmp/network-training-data-vgg16/mTypeDetector' + filepattern + 'Weights.h5'
mDetectorNetworkFile = 'fontIdentificationTool/data/output/neuronal-network-vgg16/mTypeDetector' + filepattern + 'Network.h5'
mDetectorNetworkQualityReportFile = 'fontIdentificationTool/data/output/neuronal-network-vgg16/mTypeDetector' + filepattern + 'QualityReport.txt'

############################################################
# Método main de la red neuronal de entrenamiento de detección de tipos de m
############################################################
if __name__ == "__main__":
    # Nos movemos al directorio de trabajo adecuado y creamos los directorios de salida y temporales
    os.chdir(workingDir)
    for directory in [os.path.dirname(mDetectorNetworkFile), os.path.dirname(mDetectorNetworkTemporalFile)]:
        if not os.path.exists(directory):
            os.makedirs(directory)

    # Realizamos el entrenamiento de la red
    print('Configurando red')
    netTrainer = Layer16FixedConvNetwork(traiCollectionMTypeDetectorOutputFile, mDetectorNetworkTemporalFile, patience, epochs, imgRotationRange)  # Change to Layer16FixedConvNetwork
    print('Entrenando')
    netTrainer.trainNetwork()
    print('Guardando modelo y estadísticas')
    netTrainer.saveNetwork(mDetectorNetworkFile, mDetectorNetworkQualityReportFile)
    sys.exit()
