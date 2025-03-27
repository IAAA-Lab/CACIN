import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FiEdit } from 'react-icons/fi';
import i18n from '../i18n/i18';


function Example() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const selectImage = async () => {
    try {
      // const file = await selectFile(); 
      // this.visualize(file);
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const selectFile = () => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*'; // Solo permitir imágenes
      input.onchange = (event) => {
        const file = event.target.files[0];
        resolve(file);
      };
      input.click();
    });
  };

  return (
    <>
      <style type="text/css">
        {`
          .btn-orange {
            background-color: #ECB289;
            color: black;
            border: 1px solid;
            border-radius: 5px;
          }      
        `}
      </style>

      <Button variant="orange" onClick={handleShow}>
        <FiEdit/>
      </Button>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>{i18n.t("modalImage.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
          <Button 
            variant="primary" 
            onClick={selectImage}
          >
            Selección imagen
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Example;