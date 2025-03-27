############################################################
#programa de entrenamiento de la red neuronal de detección de Ms
############################################################
import os, sys
sys.path.append('..')
sys.path.append('../training/dataTypes')
sys.path.append('../training/networks')
import training
from training.networks.Layer5FixedConvNetwork import Layer5FixedConvNetwork

############################################################
#parametros de entrenamiento de la red neuronal
############################################################
type = 'fixedConv'
patience = 200
epochs = 1000
imgRotationRange = 4

############################################################
#configuracion del direcctorio de trabajo y ficheros de entrada y salida
############################################################
workingDir='../' #para que se ejecute en la máuquina remota el directorio debe ser ../ y no cualquier otro
traiCollectionMTypeDetectorOutputFile = training.traiCollectionMTypeDetectorOutputFile;
filepattern = type+'_'+str(epochs)+'_'+str(patience)+'_'+str(imgRotationRange)+'_';
mDetectorNetworkTemporalFile ='data/tmp/network-training-data/mTypeDetector'+filepattern+'Weights.h5';
mDetectorNetworkFile ='data/output/neuronal-network/mTypeDetector'+filepattern+'Network.h5';
mDetectorNetworkQualityReportFile ='data/output/neuronal-network/mTypeDetector'+filepattern+'QualityReport.txt';

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
    netTrainer = Layer5FixedConvNetwork(traiCollectionMTypeDetectorOutputFile,mDetectorNetworkTemporalFile, patience, epochs, imgRotationRange);
    print('Entrenando');
    netTrainer.trainNetwork();
    print('Guardando modelo y estadisticas');
    netTrainer.saveNetwork(mDetectorNetworkFile,mDetectorNetworkQualityReportFile);
    sys.exit();
