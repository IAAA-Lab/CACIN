import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FiEdit, FiX } from 'react-icons/fi';
import ImageModal from './ImageModal';
import Tiff from 'tiff.js';

const ImageUploader = ({ onFileChange, loading }) => {
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setFileError('');
      onFileChange(file);

      var xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.open('GET', URL.createObjectURL(file), true);

      xhr.onload = function (e) {
        var arrayBuffer = this.response;
        Tiff.initialize({ TOTAL_MEMORY: 16777216 * 10 });
        var tiff = new Tiff({ buffer: arrayBuffer });
        var dataUri = tiff.toDataURL();
        setImageSrc(dataUri);
        document.getElementById('image').src = dataUri;
      };

      xhr.send(); 
    }
  };

  const handleRemoveImage = () => {
    setFileName('');
    onFileChange(null);
    setImageSrc('');
    document.getElementById('image').src = '';
  };

  const handleModalShow = () => setShowModal(true);
  const handleModalClose = () => setShowModal(false);

  return (
    <div className="custom-file-upload">
      <input
        type="file"
        accept=".tiff,.tif"
        onChange={handleFileChange}
        id="file-input"
        style={{ display: 'none' }}
      />
      <Button
        variant="orange"
        onClick={() => document.getElementById('file-input').click()}
        disabled={loading}
      >
        <FiEdit />
      </Button>
      {fileName && (
        <div style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '10px' }}>
          <p style={{ margin: 0, marginRight: '5px' }}>{fileName}</p>
          <Button
            variant="link"
            onClick={handleRemoveImage}
            style={{ padding: 0, fontSize: '1.5rem', color: 'red' }}
          >
            <FiX />
          </Button>
        </div>
      )}
      {fileError && <div className="error">{fileError}</div>}

      <img id="image" onClick={handleModalShow} style={{ cursor: 'pointer', display: 'block', marginTop: '10px', maxWidth: '50%' }} />
      <ImageModal
        show={showModal}
        onHide={handleModalClose}
        imageSrc={imageSrc}
      />
    </div>
  );
};

export default ImageUploader;