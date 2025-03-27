############################################################
#programa de entrenamiento de la red neuronal de detección de Ms
############################################################
import os, sys
sys.path.append('..')
import training
from training.networks.Layer16FixedConvWithSizeNetwork import Layer16FixedConvWithSizeNetwork
from training.networks.Layer2FixedConvWithSizeNetwork import Layer2FixedConvWithSizeNetwork
from training.networks.Layer1FixedConvWithSizeNetwork import Layer1FixedConvWithSizeNetwork

############################################################
#parametros de entrenamiento de la red neuronal
############################################################
type = 'vgg16'
patience = 50
epochs = 1000
imgRotationRange = 4

############################################################
#configuracion del direcctorio de trabajo y ficheros de entrada y salida
############################################################
workingDir='../' #para que se ejecute en la máuquina remota el directorio debe ser ../ y no cualquier otro
traiCollectionMDetectorOutputFile = training.traiCollectionMDetectorOutputFile;
filepattern = type+'_'+str(epochs)+'_'+str(patience)+'_'+str(imgRotationRange)+'_';
mDetectorNetworkTemporalFile ='data/tmp/network-training-data-vgg16/mDetector'+filepattern+'Weights.h5';
mDetectorNetworkFile ='data/output/neuronal-network-vgg16/mDetector'+filepattern+'Network.h5';
mDetectorNetworkQualityReportFile ='data/output/neuronal-network-vgg16/mDetector'+filepattern+'QualityReport.txt';

############################################################
############################################################
#Metodo main de la red neuronal de entrenamiento de deteccion de tipos de m
############################################################
if __name__ == "__main__":
    #nos movemos al directirio de trabajo adecuado y cremos los directorios de salida y temporales
    os.chdir(workingDir);
    dir = os.path.dirname(mDetectorNetworkFile);
    if not os.path.exists(dir): os.makedirs(dir);
    dir = os.path.dirname(mDetectorNetworkTemporalFile);
    if not os.path.exists(dir): os.makedirs(dir);

    # realizamos el entrenamiento de la red
    print('Configurando red');
    netTrainer = Layer16FixedConvWithSizeNetwork(traiCollectionMDetectorOutputFile,mDetectorNetworkTemporalFile, patience, epochs, imgRotationRange);
    print('Entrenando');
    netTrainer.trainNetwork();
    print('Guardando modelo y estadisticas');
    netTrainer.saveNetwork(mDetectorNetworkFile,mDetectorNetworkQualityReportFile);
    sys.exit();
