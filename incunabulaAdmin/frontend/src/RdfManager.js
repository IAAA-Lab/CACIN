////////////////////////////////////////////////////////////////////
//Fichero para contener operaciones sobre RDF
////////////////////////////////////////////////////////////////////

import {BlankNode} from "rdflib";
const $rdf = require('rdflib')

////////////////////////////////////////////////////////////////////
//añade un nodo de caracter  al modelo rdf en el sujeto indicado
export function addRdfCharacter (rdfGraph, rdfNode, box) {
    var unionNode = new BlankNode()
    rdfGraph.add(rdfNode, $rdf.sym('http://iaaa.es/incunabula#character'), unionNode);
    rdfGraph.add(unionNode, $rdf.sym('http://iaaa.es/incunabula#xPos'), box.xPos);
    rdfGraph.add(unionNode, $rdf.sym('http://iaaa.es/incunabula#yPos'), box.yPos);
    rdfGraph.add(unionNode, $rdf.sym('http://iaaa.es/incunabula#width'), box.width);
    rdfGraph.add(unionNode, $rdf.sym('http://iaaa.es/incunabula#height'), box.height);
}

////////////////////////////////////////////////////////////////////
//borra un caracter del modelo rdf
export function deleteRDFCharacter(rdfGraph, rdfNode){
    rdfGraph.remove(rdfGraph.statementsMatching(rdfNode, undefined, undefined))
    rdfGraph.remove(rdfGraph.statementsMatching(undefined, undefined, rdfNode))
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
//Obtiene la información de un caracter (nodo en blanco) del RDF
function getCharInfo(rdfGraph, rdfNode){
    const xPos  = parseFloat(rdfGraph.statementsMatching(rdfNode, $rdf.sym('http://iaaa.es/incunabula#xPos'), undefined)[0].object.value);
    const yPos  = parseFloat(rdfGraph.statementsMatching(rdfNode, $rdf.sym('http://iaaa.es/incunabula#yPos'), undefined)[0].object.value);
    const width  = parseFloat(rdfGraph.statementsMatching(rdfNode, $rdf.sym('http://iaaa.es/incunabula#width'), undefined)[0].object.value);
    const height  = parseFloat(rdfGraph.statementsMatching(rdfNode, $rdf.sym('http://iaaa.es/incunabula#height'), undefined)[0].object.value);
    const assign = rdfGraph.statementsMatching(rdfNode, $rdf.sym('http://iaaa.es/incunabula#symbol'), undefined)
    const assignedChar =  assign.length>0 ? assign[0].object.value : undefined
    return {xPos,yPos,width,height,assignedChar}
}

////////////////////////////////////////////////////////////////////
//obtiene el recurso rdf que contiene el click de raton o null si no hay ninguno
export function getCharInfoAtPosition(rdfGraph, pos){
    console.log("rdfGraph", rdfGraph)
    const rdfNodeList = rdfGraph.statementsMatching(undefined, $rdf.sym('http://iaaa.es/incunabula#character'), undefined);
    for (var i=0; i<rdfNodeList.length;i++) {
        const rdfNode = rdfNodeList[i].object
        const box = getCharInfo(rdfGraph,  rdfNode)
        if (box.xPos <= pos.x && box.yPos <= pos.y && (box.xPos + box.width) >= pos.x && (box.yPos + box.height) >= pos.y) {
            return {rdfNode, box}
        }
    }
    return null
}

////////////////////////////////////////////////////////////////////
//busca los rectangulos seleccionados en el area a unir en el rdf
export function getCharInfoAtRegion(rdfGraph, region){
    var charInfoList =[]
    const rdfNodeList = rdfGraph.statementsMatching(undefined, $rdf.sym('http://iaaa.es/incunabula#character'), undefined);
    for (var i=0; i<rdfNodeList.length;i++) {
        const rdfNode = rdfNodeList[i].object
        const box = getCharInfo(rdfGraph, rdfNode)
        if (box.xPos >= region.xPos && box.yPos >= region.yPos && box.xPos  <= (region.xPos +region.width) && box.yPos <= (region.yPos+region.height)) {
            charInfoList.push({rdfNode, box})
        }
    }
    return charInfoList
}

////////////////////////////////////////////////////////////////////
//extrae la informacion de cada caracter del grafo rdf
export function getAllCharInfo(rdfGraph){
    var charInfoList = []
    var rdfNodeList = rdfGraph.statementsMatching(undefined, $rdf.sym('http://iaaa.es/incunabula#character'), undefined)
    for (var i=0; i<rdfNodeList.length;i++) {
        charInfoList.push(getCharInfo(rdfGraph, rdfNodeList[i].object))
    }
    return  charInfoList
}


