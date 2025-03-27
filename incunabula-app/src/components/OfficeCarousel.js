import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import i18 from '../i18n/i18';
import OfficeTable from './OfficeTable';

function OfficeCarousel({ handleOfficeSelect }) {
  const [show, setShow] = useState(false);
  const officesPage = 6;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSelect = (office) => {
    handleOfficeSelect(office);

    setShow(false);
  };

  return (
    <>
      <Button
        variant='orange'
        onClick={handleShow}
        className='mt-4'
      >
        {i18.t("printingOffice.search")}
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ backgroundColor: '#ECB289' }}>
          <Modal.Title>{i18.t("printingOffice.title")}</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: '85vh', overflowY: 'auto' }}>
          <div style={{ maxWidth: "768px", margin: "0 auto", padding: "1rem" }}>
            <OfficeTable officesPage={officesPage} onSelectOffice={handleSelect} />
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default OfficeCarousel;