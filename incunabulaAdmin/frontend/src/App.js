import React from 'react';
import logo from './assets/logo.png';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import RegionSelect from 'react-region-select';
import {addRdfCharacter, deleteRDFCharacter, getCharInfoAtRegion, getCharInfoAtPosition, getAllCharInfo} from './RdfManager'
import {addRectangleInCanvas, addAllRectanglesInCanvas, removeRectangleInCanvas, getUnionBox, getScaledMousePos, getScaledAreaPos} from './ImageManager'
import {selectDirectory, getImageFiles, loadImage, loadMetadata, saveMetadata, saveBinaryMetadata} from './FileManager'
import {segmentImage} from './BackendManager'
import RDFUpload from './RDFUpload';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';


const $rdf = require('rdflib')
/////////////////////////////////////////////////////////////
//base de la aplicacion a mostrar en la web
function App() {
  return (
    <div className="App">
        <header className="App-header">
        <img
            src={logo}
            className="app-icon"
        />
        <h1><span>Herramienta para administraci&oacute;n</span></h1>
        </header>
        <div className="appcontent">
            <AppContent />
        </div>

    </div>
  );
}

/////////////////////////////////////////////////////////////
//clase que agrupoa el resto de clases para permitir la comunicación de estado entre ellas
class AppContent extends React.Component {
    constructor(props) {
        super(props);
        this.onAreaSelectionChange = this.onAreaSelectionChange.bind(this);
        this.state = {
            directorySelected: null,
            tiffFileList: [],
            fileSelected: logo,
            fileSelectedName : "Ningun alfabeto seleccionado",
            fileSelectedCanvas : null,
            mdGraph : null,
            imgNum:-1,
            stateName : "Modo selección M",
            state : "SelM",
            regions: [],
            isExporting: false,
        }
    }

    /////////////////////////////////////////////////////////////
    //selecciona el directorio con las imagenes y carga los nombres de las imagenes
    async selectImageDirectory(evt){
        const directory = await selectDirectory();
        const fileList = await getImageFiles(directory)
        this.visualize(fileList[0])
        this.setState({directorySelected : directory, tiffFileList : fileList, imgNum: 0});
    }

    /////////////////////////////////////////////////////////////
    //carga un tiff en el estado del componente
    async visualize(file){
        //cargamos la imagen del fichero y sus metadatos, si existen los dibujamos en la imagen
        var canvas = await loadImage(file)
        console.log("canvas visualize", canvas)
        const rdfGraph = await loadMetadata(file.name.substring(0,file.name.lastIndexOf('.'))+".rdf", this.state.directorySelected)
        console.log("rdfGraph visualize", rdfGraph)
        if (rdfGraph !=null) {
            console.log("dentro if", rdfGraph)
            this.setState({mdGraph: rdfGraph})
            canvas = addAllRectanglesInCanvas(canvas, getAllCharInfo(rdfGraph))
        }
        //refrescamos el estado de la aplicación respecto a la imagen
        URL.revokeObjectURL(this.state.fileSelected);
        this.setState({fileSelectedCanvas: canvas, fileSelected: canvas.toDataURL(), fileSelectedName: "Alfabeto " + file.name})
    };

    /////////////////////////////////////////////////////////////
    //carga la siguiente imagen
    nextImg(evt){
        let pos = this.state.imgNum;
        if (pos >= 0) {
            pos = (pos === this.state.tiffFileList.length - 1) ? 0 : pos + 1;
            this.visualize(this.state.tiffFileList[pos])
            this.setState({imgNum: pos});
        }
    }

    /////////////////////////////////////////////////////////////
    //carga la anterior imagen
    prevImg(evt){
        let pos = this.state.imgNum;
        if (pos >= 0) {
            pos = (pos === 0) ? this.state.tiffFileList.length - 1 : pos - 1;
            this.visualize(this.state.tiffFileList[pos])
            this.setState({imgNum: pos});
        }
    }

    /////////////////////////////////////////////////////////////
    //manda la imagen al servicio de segmentacion
    async processImg(evt){
        const pos = this.state.imgNum;
        if (pos >= 0) {
            const directory = this.state.directorySelected;
            const file = this.state.tiffFileList[pos];
            const rdfName = file.name.substring(0,file.name.lastIndexOf('.'))+".rdf";
            await saveBinaryMetadata(rdfName, directory, await segmentImage(file))
            this.visualize(file)
        }
    }

    /////////////////////////////////////////////////////////////
    // cambia el modo de trabajo de la aplicación, entre seleccion borrado, segmentado y union
    changeSelectionMode(evt){
        var evento = evt.toString()
        if (evento==="\\#SelM") {
            this.setState({state: "SelM", stateName: "Modo selección M"})
        }else if (evento==="\\#SelQ") {
            this.setState({state: "SelQ", stateName: "Modo selección Q"})
        }        else if (evento==="\\#Borr"){
            this.setState({state: "Borr", stateName: "Modo borrado elementos"})
        }else if (evento==="\\#Crea") {
            this.setState({state: "Crea", stateName: "Modo creación elementos"})
        }else{
            this.setState({state: "Unio", stateName: "Modo union elementos"})
        }
    }

    //selecciona una m de la imagen del alfabeto
    async processMouseClick(evt) {
        if((this.state.state!=="SelM" && this.state.state!=="SelQ" && this.state.state!=="Borr") || this.state.fileSelectedCanvas === null){return}
        var canvas = this.state.fileSelectedCanvas;
        var rdfGraph = this.state.mdGraph;
        console.log("state", this.state)
        console.log("rdfGraph process", rdfGraph)
        console.log("scaledMousePos", getScaledMousePos(canvas, evt))
        const rdfInfo = getCharInfoAtPosition(rdfGraph, getScaledMousePos(canvas, evt))
        if(rdfInfo != null){
            if(this.state.state==="SelM"){
                //actualizamos los metadatos segun correspnda
                if (rdfInfo.box.assignedChar===undefined){
                    rdfGraph.add(rdfInfo.rdfNode, $rdf.sym('http://iaaa.es/incunabula#symbol'), "M");
                    rdfInfo.box.assignedChar='M'
                }else{
                    rdfGraph.remove(rdfGraph.statementsMatching(rdfInfo.rdfNode, $rdf.sym('http://iaaa.es/incunabula#symbol'), undefined))
                    rdfInfo.box.assignedChar=undefined
                }
                //actualizamos la imagen
                canvas = addRectangleInCanvas(canvas,rdfInfo.box)
            }else if(this.state.state==="SelQ"){
                //actualizamos los metadatos segun correspnda
                if (rdfInfo.box.assignedChar===undefined){
                    rdfGraph.add(rdfInfo.rdfNode, $rdf.sym('http://iaaa.es/incunabula#symbol'), "Q");
                    rdfInfo.box.assignedChar='Q'
                }else{
                    rdfGraph.remove(rdfGraph.statementsMatching(rdfInfo.rdfNode, $rdf.sym('http://iaaa.es/incunabula#symbol'), undefined))
                    rdfInfo.box.assignedChar=undefined
                }
                //actualizamos la imagen
                canvas = addRectangleInCanvas(canvas,rdfInfo.box)
            }else if(this.state.state==="Borr"){
                deleteRDFCharacter(rdfGraph, rdfInfo.rdfNode)
                canvas = removeRectangleInCanvas(canvas,rdfInfo.box)
            }
            await saveMetadata(this.state.fileSelectedName, this.state.directorySelected, rdfGraph)
            URL.revokeObjectURL(this.state.fileSelected)
            this.setState({fileSelected: canvas.toDataURL()});
        }

    }

    /////////////////////////////////////////////////////////////
    //procesa el area seleccionada de la imagen
    async processAreaSelection(evt){
        if((this.state.state!=="Unio" && this.state.state!=="Crea") || this.state.fileSelectedCanvas === null || this.state.regions.length===0){return}
        var mdGraph = this.state.mdGraph;
        var canvas = this.state.fileSelectedCanvas;
        const regions = this.state.regions
        const rdfNode = mdGraph.statementsMatching(undefined, $rdf.sym('http://iaaa.es/incunabula#character'), undefined)[0].subject
        const charInfoList = getCharInfoAtRegion(mdGraph, getScaledAreaPos(regions[0],canvas))
        var box = undefined
        //proceso a realizar con el area si el modo es de union
        if (this.state.state === "Unio" && charInfoList.length>0) {
            //borramos los nodos seleccionados del modelo
            for(var i =0 ; i< charInfoList.length; i++){
                deleteRDFCharacter(mdGraph, charInfoList[i].rdfNode)
                canvas =removeRectangleInCanvas(canvas, charInfoList[i].box)
            }
            //añadimos el nuevo elemento union al metadato y a la imagen
            box = getUnionBox(this.getBoxes(charInfoList))
        //proceso a realizar para crear un nuevo recurso
        }else if(this.state.state === "Crea" && charInfoList.length===0){
            box = getScaledAreaPos(regions[0],canvas)
        }else{return}
        //añadimos la nueva informacion al modelo y canvas
        addRdfCharacter(mdGraph, rdfNode ,box)
        await saveMetadata(this.state.fileSelectedName, this.state.directorySelected, mdGraph)
        addRectangleInCanvas(canvas, box)
        URL.revokeObjectURL(this.state.fileSelected)
        this.setState({fileSelected: canvas.toDataURL()});
    }

    /////////////////////////////////////////////////////////////
    //extrae los rectangulos que enbeben los caracteres
    getBoxes(charInfoList){
        var charBoxList = []
        for(var i =0 ; i< charInfoList.length; i++){
            charBoxList.push(charInfoList[i].box)
        }
        return charBoxList
    }

    /////////////////////////////////////////////////////////////
    //detecta los cambios en el el area seleccionada de la imagen
    onAreaSelectionChange (regions) {
		this.setState({regions: regions});
	}

    async exportMetadata(evt) {
        this.setState({ isExporting: true });
        try {
            const response = await axios.post('http://localhost:8001/api/export/', null, {
                responseType: 'blob' // Indica que esperas un archivo binario (Blob).
            });

            if (response.headers['content-type'] === 'application/rdf+xml') {
                // Descargar archivo RDF
                const blob = new Blob([response.data], { type: 'application/rdf+xml' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'exported_file.rdf');
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                // Asume que la respuesta contiene JSON si no es RDF
                const reader = new FileReader();
                reader.onload = () => {
                    const jsonResponse = JSON.parse(reader.result);
                    alert(jsonResponse.message || 'Error inesperado.');
                };
                reader.readAsText(response.data);
            }
        } catch (error) {
            console.error('Error al exportar los metadatos:', error);
            alert('Error al exportar los metadatos.');
        } finally {
            this.setState({ isExporting: false });
        }
    }


    /////////////////////////////////////////////////////////////
    //renderiza el elemento principal de la app
    render() {
        const regionStyle = {
			background: 'rgba(255, 0, 0, 0.5)'
		};
        return (
            <div className="componentagrupation">
            <p></p>
            <div className="row">
                <div className="col">
                    <Button variant="primary" onClick={evt => this.selectImageDirectory(evt)}>
                        Selección directorio imagenes
                    </Button>
                    <p></p>
                    <div dangerouslySetInnerHTML={{ __html: this.state.fileSelectedName }} />
                    <p></p>
                    <div>
                        <Button variant="info" onClick={evt => this.prevImg(evt)}>Anterior</Button>{" "}
                        <Button variant="primary" onClick={evt => this.processImg(evt)}>Procesa Imagen</Button>{" "}
                        <Button variant="info" onClick={evt => this.nextImg(evt)}>Siguiente</Button>
                    </div>
                    <p></p>
                    <div className="btn-group">
                        <DropdownButton
                            id="dropdown-item-button"
                            onSelect={evt => this.changeSelectionMode(evt)}
                            title={this.state.stateName}
                        >
                            <Dropdown.Item href="#SelM">Modo selección M</Dropdown.Item>
                            <Dropdown.Item href="#SelQ">Modo selección Q</Dropdown.Item>
                            <Dropdown.Item href="#Borr">Modo borrado elementos</Dropdown.Item>
                            <Dropdown.Item href="#Crea">Modo creación elementos</Dropdown.Item>
                            <Dropdown.Item href="#Unio">Modo union elementos</Dropdown.Item>
                        </DropdownButton>
                        <Button
                            variant="primary"
                            disabled={this.state.state === "SelM" || this.state.state === "SelQ" || this.state.state === "Borr"}
                            onClick={evt => this.processAreaSelection(evt)}
                        >
                            Procesa area seleccionada
                        </Button>
                    </div>
                </div>
        
                <div className="col">
                    <RDFUpload />
                    <p></p>
                    <Button variant="success" onClick={evt => this.exportMetadata(evt)}>
                        Exportar base de datos a fichero
                    </Button>
                </div>
            </div>
            <p></p>
            {this.state.state === "SelM" || this.state.state === "SelQ" || this.state.state === "Borr" ? (
                <img
                    src={this.state.fileSelected}
                    className="alphabet"
                    alt="alp"
                    width={this.state.fileSelected === logo ? "500" : "1800"} // Cambiar el ancho si es el logo
                    onMouseDown={evt => this.processMouseClick(evt)}
                />
            ) : (
                <RegionSelect
                    maxRegions={1}
                    regions={this.state.regions}
                    regionStyle={regionStyle}
                    onChange={this.onAreaSelectionChange}
                    style={{ border: '1px solid black' }}
                >
                    <img
                        src={this.state.fileSelected}
                        id="image"
                        className="alphabet"
                        alt="alp"
                        width={this.state.fileSelected === logo ? "500" : "1800"} // Cambiar el ancho si es el logo
                    />
                </RegionSelect>
            )}

            <p></p>
            {this.state.isExporting && (
                <div className="overlay">
                    <div className="spinner-container">
                        <Spinner animation="border" role="status" style={{ color: '#ECB289' }} />
                        <p>Exportando metadatos, por favor espera...</p>
                    </div>
                </div>
            )}
        </div>
        
        );
    }
}


export default App;