import os

model = os.getenv('MODEL', 'neuronal-network_small')

trainingCollectionInputFile = "/home/hala/work/dec/reconocimiento-tipografias-incunabula2.0/fontClassification/fontIdentificationTool/data/tmp/network-training-data/trainCollectionMTypeDetector.bin"
mDetectNetworkFile = f"/home/hala/work/dec/reconocimiento-tipografias-incunabula2.0/fontClassification/fontIdentificationTool/data/output/{model}/mDetectorfixedConvWithSize_1000_50_4_Network.h5"
mTypeDetectNetworkFile = f"/home/hala/work/dec/reconocimiento-tipografias-incunabula2.0/fontClassification/fontIdentificationTool/data/output/{model}/mTypeDetectorfixedConv_1000_200_4_Network.h5"
