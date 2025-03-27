////////////////////////////////////////////////////////////////////
//Fichero de funciones para cargar y guardar ficheros en disco
////////////////////////////////////////////////////////////////////

var Tiff = require('tiff.js');
const $rdf = require('rdflib')

////////////////////////////////////////////////////////////////////
//realiza la selección del directorio que contiene las imagenes a procesar, devuelve el nombre del directorio y las imagenes
export async function selectDirectory() {
    // Use the showDirectoryPicker function instead of chooseFileSystemEntries
    const directoryHandle = await window.showDirectoryPicker();
    console.log('Directorio seleccionado:', directoryHandle);
    return directoryHandle;
}


////////////////////////////////////////////////////////////////////
//obtiene las referencias a los ficheros de imagenes del directorio
export async function getImageFiles(directoryHandle) {
    let fileList = [];

    for await (const entry of directoryHandle.values()) {
        if (entry.kind === 'file' && (entry.name.endsWith(".tiff") || entry.name.endsWith(".tif"))) {
            const file = await entry.getFile();
            fileList.push(file);
        }
    }

    return fileList;
}



/////////////////////////////////////////////////////////////
//carga una imagen de un fichero
export async function loadImage(imageFile) {
    const content = await imageFile.arrayBuffer();
    return (new Tiff({ buffer: content })).toCanvas();
}


////////////////////////////////////////////////////////////////////
//carga un grafo rdf de un fichero
export async function loadMetadata(fileName, directory) {
    try {
        // Intentar obtener el archivo
        const fileHandle = await directory.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        const fileBuffer = await file.arrayBuffer();
        const data = new TextDecoder().decode(fileBuffer);

        // Crear el grafo RDF y analizar los datos
        const rdfGraph = $rdf.graph();
        $rdf.parse(data, rdfGraph, 'http://iaaa.es/incunabula#', 'text/turtle');
        return rdfGraph;
    } catch (error) {
        console.error(`Error loading metadata for ${fileName}:`, error);
        return null;
    }
}

/////////////////////////////////////////////////////////////
//guarda los metadatos en un fichero
export async function saveBinaryMetadata(fileName, directoryHandle, data) {
    // Get a handle to the file, creating it if it doesn't exist
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    
    // Create a writable stream to the file
    const writableStream = await fileHandle.createWritable();
    
    // Write the data to the file
    await writableStream.write(data);
    
    // Close the writable stream
    await writableStream.close();
}


////////////////////////////////////////////////////////////////////
//guarda los metadatos de la imagen en el fichero indicado
export async function saveMetadata(fileName, directory, rdfGraph) {
    const rdfName= fileName.substring(0,fileName.lastIndexOf('.')).split(" ")[1]+".rdf"
    const data = $rdf.serialize(undefined, rdfGraph, "http://www.unizar.es/", 'text/turtle')
    await saveBinaryMetadata(rdfName,directory,data)
}

