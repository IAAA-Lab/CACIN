import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { FiTrash2 } from 'react-icons/fi';
import i18 from "../i18n/i18";
import { deleteIncunabula } from "../services/IncunabulaServices";

function DeleteIncunabulaModal({ bookToDelete, onDeleteSuccess }) {

  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = (e) => {
    e.stopPropagation();
    setShow(false); 
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await deleteIncunabula(bookToDelete);
      onDeleteSuccess(bookToDelete);
      setShow(false); 
    } catch (error) {
      console.error("Error deleting the book:", error);
    }
  };   

  return (
    <>
      <Button variant="danger" 
        onClick={(e) => {
          e.stopPropagation(); 
          handleShow(); 
        }}
      >
        <FiTrash2 />
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header style={{ backgroundColor: '#ECB289' }}>
          <Modal.Title>
            {i18.t("bookToDelete.modalTitle")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {i18.t("bookToDelete.modalInfo")}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {i18.t("bookToDelete.cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete}>{i18.t("bookToDelete.yes")}</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DeleteIncunabulaModal;