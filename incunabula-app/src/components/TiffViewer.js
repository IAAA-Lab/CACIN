import React, { useEffect, useState } from 'react';
import ImageModal from './ImageModal';
import Tiff from 'tiff.js';

const TiffViewer = ({ fileUrl }) => {
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const displayTiffImageFromUrl = (fileUrl) => {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer'; // Necesitamos cargar el archivo como un buffer
      xhr.open('GET', fileUrl, true); // Abre la conexión a la URL del archivo

      // Callback cuando se carga la imagen
      xhr.onload = function (e) {
        if (this.status === 200) {
          var arrayBuffer = this.response; // Obtenemos el buffer del archivo

          // Inicializamos la librería Tiff.js
          Tiff.initialize({ TOTAL_MEMORY: 16777216 * 10 });
          try {
            var tiff = new Tiff({ buffer: arrayBuffer });
            var dataUri = tiff.toDataURL(); // Convertimos el archivo TIFF a una imagen base64
            setImageSrc(dataUri);
            // Asignamos la imagen al elemento <img> con id "tiff-image"
            document.getElementById('tiff-image').src = dataUri;
          } catch (e) {
            setError('No se pudo procesar la imagen TIFF.');
          }
        } else {
          setError('No se pudo cargar el archivo TIFF desde la URL.');
        }
      };

      xhr.onerror = function () {
        setError('Error al intentar cargar el archivo TIFF.');
      };

      xhr.send();
    };

    if (fileUrl) {
      displayTiffImageFromUrl(fileUrl);
    }
  }, [fileUrl]);

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <img id="tiff-image" onClick={handleModalShow} style={{ cursor: 'pointer', display: 'block', marginTop: '10px', maxWidth: '50%' }} /><ImageModal
            show={showModal}
            onHide={handleModalClose}
            imageSrc={imageSrc} />
        </>
      )}
    </div>
  );
};

export default TiffViewer;
