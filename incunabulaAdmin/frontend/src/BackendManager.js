////////////////////////////////////////////////////////////////////
//Fichero de funciones para hacer llamadas al backend
////////////////////////////////////////////////////////////////////

const axios = require('axios').default;

/////////////////////////////////////////////////////////////
//manda la imagen al servicio de procesamiento
export async function segmentImage(imageFile) {
    console.log("image file", imageFile)
    const form_data = new FormData();
    form_data.append('file', imageFile);
    var imageMd = null
    await axios({ url: 'http://127.0.0.1:8001/api/segmentAlphabet/', method: 'post', data: form_data, headers: { 'Content-Type': 'multipart/form-data' } })
        .then(async function (response) { imageMd = response.data })
        .catch(function (response) { console.log(response) });
    return imageMd
}


