import { useState, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import i18 from '../i18n/i18';

function OfficeModal({ book }) {
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);

  const handleClick = (event) => {
    setShow(!show);
    setTarget(event.target);
  };

  return (
    <div ref={ref}>
      <Button variant="orange" onClick={handleClick}>
        {book.printingOffice?.id}
      </Button>

      <Overlay
        show={show}
        target={target}
        placement="bottom"
        container={ref}
        containerPadding={20}
      >
        <Popover id="popover-contained">
          <Popover.Header
            as="h3"
            style={{ backgroundColor: '#ECB289', color: '#000' }}
          >
            {i18.t("printingOffice.title")}
          </Popover.Header>
          <Popover.Body>
            {book.printingOffice?.officeName && <p className='m-1'>
                <strong>{i18.t("printingOffice.name")}:</strong> {book.printingOffice.officeName}
            </p>}
            {book.printingOffice?.alternativeName && <p className='m-1'>
                <strong>{i18.t("printingOffice.alternativeName")}:</strong> {book.printingOffice.alternativeName}
            </p>}
            {book.printingOffice?.foundedYear && <p className='m-1'>
                <strong>{i18.t("printingOffice.foundedYear")}:</strong> {book.printingOffice.foundedYear}
            </p>}
            {book.printingOffice?.closedYear && <p className='m-1'>
                <strong>{i18.t("printingOffice.closedYear")}:</strong> {book.printingOffice.closedYear}
            </p>}
            {book.printingOffice?.location && <p className='m-1'>
                <strong>{i18.t("printingOffice.location")}:</strong> {book.printingOffice.location}
            </p>}
          </Popover.Body>
        </Popover>
      </Overlay>
    </div>
  );
}

export default OfficeModal;
