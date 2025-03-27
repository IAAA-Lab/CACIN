import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import i18 from "../i18n/i18";

function AddModal({ modalShow, setModalShow, idBook, setLocation }) {
  return (
    <Modal show={modalShow}>
      <Modal.Header>
        <Modal.Title>{i18.t("modalAdd.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {i18.t("modalAdd.info")}
        <br/>
        <strong>{i18.t("modalAdd.bookId")}:</strong> {idBook}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="orange" 
          onClick={() => {
            setLocation(`${i18.language === 'es' ? '/es' : '/en'}/editDelete`);
            setModalShow(false);
          }}
        >
          {i18.t("accept")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddModal;
