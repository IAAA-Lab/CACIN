////////////////////////////////////////////////////////////////////
//Fichero de funciones para manipular imagenes
////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
//actualiza el canvas de la imagen con el rectangulo del color que corresponda
export function addRectangleInCanvas(canvas, box){
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = (box.assignedChar===undefined) ? "green" : "red"
    ctx.lineWidth = 6;
    ctx.strokeRect(box.xPos, box.yPos, box.width, box.height);
    return canvas
}

/////////////////////////////////////////////////////////////
//dibuja en un canvas los bounding box de los caracteres
export function addAllRectanglesInCanvas(canvas, boxes){
    for (var i=0; i<boxes.length;i++) {
        canvas = addRectangleInCanvas (canvas, boxes[i])
    }
    return canvas
}

////////////////////////////////////////////////////////////////////
//borra el rectangulo seleccionado
export function removeRectangleInCanvas(canvas, box){
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";
    ctx.lineWidth = 6;
    ctx.strokeRect(box.xPos, box.yPos, box.width, box.height);
    return canvas
}

////////////////////////////////////////////////////////////////////
//se le pasa una colección de cajas y devuelve una caja con el area que tiene la union de los rectangulos
export function getUnionBox(boxes){
    var minx = boxes[0].xPos
    var miny = boxes[0].yPos
    var maxx = boxes[0].xPos + boxes[0].width
    var maxy = boxes[0].yPos + boxes[0].height
    for (var i = 1; i < boxes.length; i++) {
        if(boxes[i].xPos<minx){minx=boxes[i].xPos}
        if(boxes[i].yPos<miny){miny=boxes[i].yPos}
        if(boxes[i].xPos + boxes[i].width>maxx){maxx=boxes[i].xPos + boxes[i].width}
        if(boxes[i].yPos + boxes[i].height>maxy){maxy=boxes[i].yPos + boxes[i].height}
    }
    return {xPos: minx, yPos: miny, width: maxx-minx , height: maxy-miny, assignedChar: undefined}
}

/////////////////////////////////////////////////////////////
//obtiene la posición del raton escalada en un canvas
export function  getScaledMousePos(canvas, mouse) {
    const rect = mouse.target.getBoundingClientRect()
    const x = (mouse.clientX - rect.left) * (canvas.width / rect.width)
    const y = (mouse.clientY - rect.top) * (canvas.height / rect.height)
    return {x,y}
}

/////////////////////////////////////////////////////////////
//obtiene el area seleccionada escalada a la imagen
export function getScaledAreaPos(region, canvas){
    const xPos = parseFloat((region.x*canvas.width/100).toFixed())
    const yPos = parseFloat((region.y*canvas.height/100).toFixed())
    const width = parseFloat(((region.x+region.width)*canvas.width/100).toFixed())-xPos
    const height = parseFloat(((region.y+region.height)*canvas.height/100).toFixed()) -yPos
    return {xPos: xPos, yPos: yPos, width : width, height: height, assignedChar: undefined}
}






