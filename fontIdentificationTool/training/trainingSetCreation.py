########################################################
#Generador de la colección de entrenamiento en un fichero único listo para entrenar.
########################################################
import bz2, glob, os, sys, pickle, training,  random, numpy as np
from rdflib import Graph, URIRef
from PIL import Image
from training.dataTypes.TrainingSet import TrainingSet

########################################################
#propiedades de rdf de los ficheros de identificacion manual de ms por tipografia
########################################################
uriCaracter = URIRef('http://iaaa.es/incunabula#character');
uriHeight = URIRef('http://iaaa.es/incunabula#height');
uriWidth = URIRef('http://iaaa.es/incunabula#width');
uriXpos = URIRef('http://iaaa.es/incunabula#xPos');
uriYpos = URIRef('http://iaaa.es/incunabula#yPos');
uriSymbol = URIRef('http://iaaa.es/incunabula#symbol');

########################################################
#configuración del generador, a la hora de multiplicar las ms en la colección completa par que quede más balanceadas
########################################################
mRatioFactor = 20;
imgRotationRange = 4;

############################################################
#configuracion del direcctorio de trabajo y ficheros de entrada y salida
############################################################
workingDir = training.workingDir;
trainingRawCollectionInputPath ='/home/hala/reconocimiento-tipografias-reorganizacionCodigo/data/input/tw_fonts_manual_training_subset';
traiCollectionMDetectorOutputFile = training.traiCollectionMDetectorOutputFile;
traiCollectionMTypeDetectorOutputFile = training.traiCollectionMTypeDetectorOutputFile;
semanticRepositoryFile = "/home/hala/reconocimiento-tipografias-reorganizacionCodigo/data/output/semantic-repository/incunZaguanRDFRepository.rdf"
anomalousCharDir = "/home/hala/reconocimiento-tipografias-reorganizacionCodigo/data/input/segmentationProblemExamples"

############################################################
############################################################
#carga la información de los alfabetos clasificados manualmente
############################################################
def loadAlphabetCollection(inputDir):
    imgList = []; imgSizeList = np.empty(shape=[0, 2],dtype=np.int32); imgClasifList = np.empty(shape=[0],dtype=np.int32); imgAlfNameList = [];
    for file in glob.glob(inputDir + "/*.rdf"):
        img = Image.open(os.path.splitext(file)[0] + '.tif');
        g = Graph(); g.parse(file, format="ttl");
        for s, p, o in g.triples((None, uriCaracter, None)):
            height = int(g.objects(o, uriHeight).__next__());
            width = int(g.objects(o, uriWidth).__next__());
            xPos = int(g.objects(o, uriXpos).__next__());
            yPos = int(g.objects(o, uriYpos).__next__());
            imgList.append(img.crop((xPos - 1, yPos - 1, xPos - 1 + width, yPos - 1 + height)));  # La segmentacion po alguna razon esta 1 despalazada
            imgSizeList = np.append(imgSizeList,np.array([[width, height]]), axis=0);
            imgClasifList = np.append(imgClasifList, [1 if (o, uriSymbol, None) in g and str(g.objects(o, uriSymbol).__next__()) == 'M' else 0]);
            imgAlfNameList.append(os.path.basename(str(s)));
    return TrainingSet(imgList, imgSizeList, imgClasifList, imgAlfNameList);

############################################################
# carga la información de los tipos de m
############################################################
def loadSemanticRepositoryMTypes(trainingSet,semanticRepository):
    ga = Graph(); ga.parse(semanticRepository, format="xml");
    mShapes = []
    for alp in trainingSet.imgAlfNameList:
        allpFile= "GfT-Tafeln/GfT-Clips/Typen/"+alp
        query ="SELECT ?shape WHERE { " \
               "?alp <http://iaaa.es/incunabula#alphabetImage> \""+allpFile+"\". " \
               "?alp <http://iaaa.es/incunabula#shape> ?shape.}"
        qres = ga.query(query)
        for row in qres:
            mShapes.append(str(row[0])); break
    trainingSet.mShapes = mShapes;

############################################################
#guarda un log de las letras generadas
############################################################
def saveLog (colection,dir,cant):
    if not os.path.exists(dir): os.makedirs(dir);
    for i in range (0, cant):
        imgv = colection.imgList[i].astype(np.bool_)
        imgv = np.reshape(imgv, (imgv.shape[0], imgv.shape[1]));
        img = Image.fromarray(imgv)
        img.save(dir+'/image_'+str(i)+'.png')
    print('valores distintos '+dir+': ', np.unique(colection.imgList))

############################################################
############################################################
#lanzador del programa principal de creación de la coleccion de entrenamiento
############################################################
if __name__ == "__main__":
    random.seed(30)
    #configuramos el directorio de salida
    os.chdir(workingDir);
    dir = os.path.dirname(traiCollectionMDetectorOutputFile);
    if not os.path.exists(dir): os.makedirs(dir);

    # obtenemos la coleccion de imagenes y separamos sus Ms,
    print("Cargando la colección de alfabetos")
    collectComplete = loadAlphabetCollection(trainingRawCollectionInputPath);
    colectM = collectComplete.getCollectionByType(TrainingSet.SET.M);
    loadSemanticRepositoryMTypes(colectM,semanticRepositoryFile)

    #reescalamos la coleccion completa, separamos las ms y las multiplicamos
    print("Preparando coleccion de letras")
    collectComplete.normalizeDataCollection(True);
    collectComplete.loadAnomalouslySegmentedChars(anomalousCharDir);
    collectComplete.createOneShotClasification(TrainingSet.MODE.CHAR);
    collectComplete.multiplySamples(mRatioFactor, imgRotationRange, TrainingSet.SET.M);
    collectComplete.randomizeCollection();

    #ressecalamos la colección de ms.
    print("Preparando coleccion de Ms")
    colectM.normalizeDataCollection(False);
    colectM.createOneShotClasification(TrainingSet.MODE.CHARTYPE)
    colectM.multiplySamples(mRatioFactor, imgRotationRange, TrainingSet.SET.ALL);
    colectM.randomizeCollection();

    # guardamos las dos colecciones de entrenamiento
    print("Guardando colecciones de entrenamiento")
    with bz2.BZ2File(traiCollectionMDetectorOutputFile, 'wb') as file: pickle.dump(collectComplete, file)
    with bz2.BZ2File(traiCollectionMTypeDetectorOutputFile, 'wb') as file: pickle.dump(colectM, file)

    #logs que guardan algunas imagenes de las generadas
    saveLog(collectComplete,'../../data/tmp/trainingSetLog/chars', 500)
    saveLog(colectM,'../../data/tmp/trainingSetLog/ms', 500)
    sys.exit();
