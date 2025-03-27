import React from 'react';
import { Modal } from 'react-bootstrap';
import i18 from '../i18n/i18';

const ImageModal = ({ show, onHide, imageSrc }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton style={{ backgroundColor: '#ECB289' }}>
        <Modal.Title>{i18.t("modalImage.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body
        style={{
          maxHeight: '80vh', // Ajusta la altura máxima del body
          overflowY: 'auto',  // Permite el scroll vertical
        }}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Modal Preview"
            style={{
              width: '100%',
              objectFit: 'contain',
            }}
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ImageModal;
