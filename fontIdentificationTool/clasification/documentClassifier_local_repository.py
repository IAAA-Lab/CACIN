import os
import time
from clasification.dataTypes.PageClassifier import PageClassifier


def classify_page(page_image_path, record_identifier=None, debug=False):
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    workingDir = os.getcwd()
    print(f"Working directory: {workingDir}")

    # Configuración de directorios y archivos
    workingDir = workingDir #'/home/hala/work/dec/reconocimiento-tipografias-incunabula2.0/incunabula/'
    mDetectNetworkFile = "./data/output/neuronal-network_small/mDetectorfixedConvWithSize_1000_50_4_Network.h5" #fontIdentificationTool
    mTypeDetectNetworkFile = "./data/output/neuronal-network_small/mTypeDetectorfixedConv_1000_200_4_Network.h5" #fontIdentificationTool
    trainingCollectionInputFile = "./data/output/neuronal-network_small/trainCollectionMTypeDetector.bin"#fontIdentificationTool
    semanticRepositoryFile = "./data/output/neuronal-network_small/incunZaguanRDFRepository.rdf" #fontIdentificationTool
    logDir = "./data/tmp/pageClassification"#fontIdentificationTool
    logDirMs = "./data/tmp/pageClassification/Ms"#fontIdentificationTool

    os.chdir(workingDir)
    if not os.path.exists(logDir):
        os.makedirs(logDir)
    if not os.path.exists(logDirMs):
        os.makedirs(logDirMs)

    # Inicialización del clasificador
    start_time = time.time()
    classifier = PageClassifier(mDetectNetworkFile, mTypeDetectNetworkFile, trainingCollectionInputFile,
                                semanticRepositoryFile)
    print("--- %s seconds ---" % (time.time() - start_time))

    # Procesamiento de la imagen
    if page_image_path:
        start_time = time.time()
        classifier.setImageToProcess(page_image_path)
        print("--- %s seconds ---" % (time.time() - start_time))
        classifier.segmentImage()
        classifier.identifyMs()
        fonts, resolution = classifier.getPageFontInformation()
        results = {
            'fonts': fonts,
            'resolution': resolution
        }
        print("--- %s seconds ---" % (time.time() - start_time))
    else:
        results = {}

    if record_identifier:
        start_time = time.time()
        fonts = classifier.getBookFontInformation(record_identifier)
        book_info = {'fonts': fonts}
        print("--- %s seconds ---" % (time.time() - start_time))
    else:
        book_info = {}

    if page_image_path and debug:
        classifier.savePageInfo(logDir, logDirMs)

    return results, book_info
