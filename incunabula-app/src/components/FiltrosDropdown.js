import React, { useState, useEffect } from 'react';
import { Accordion, Form, Button, Row, Col } from 'react-bootstrap';
import i18 from '../i18n/i18';
import Select from 'react-select';

const FiltrosDropdown = ({
  onApplyFilters,
  creatorOptions = [],
  publisherOptions = [],
  fontTypeOptions = [],
  officeOptions = []
}) => {
  const [formValues, setFormValues] = useState({
    creator: null,
    publisher: null,
    printingOffice: null,
    fontType: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters(formValues); // Notificar los filtros seleccionados
  };

  const handleReset = () => {
    const resetValues = {
      creator: null,
      publisher: null,
      printingOffice: null,
      fontType: ''
    };
    setFormValues(resetValues);
    onApplyFilters(resetValues); // Notificar el reinicio de filtros
  };

  const handleSelectChange = (field) => (selectedOption) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [field]: selectedOption?.value || null
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value
    }));
  };

  return (
    <div>
      <style type="text/css">
        {`
          .btn-orange {
            background-color: #ECB289;
            color: black;
            border: 1px solid;
            border-radius: 5px;
          }

          .btn-white {
            background-color: white;
            color: black;
            border: 1px solid;
            border-radius: 5px;
          }
        `}
      </style>

      <Accordion className="m-2">
        <Accordion.Item eventKey="0">
          <Accordion.Header>{i18.t("filters.title")}</Accordion.Header>
          <Accordion.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6} lg={3}>
                  <Form.Group controlId="creator">
                    <Form.Label>{i18.t("filters.creator")}</Form.Label>
                    <Select
                      options={creatorOptions}
                      value={creatorOptions.find((option) => option.value === formValues.creator) || null}
                      onChange={handleSelectChange('creator')}
                      placeholder={i18.t("filters.creator")}
                      isClearable
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={3}>
                  <Form.Group controlId="publisher">
                    <Form.Label>{i18.t("filters.publisher")}</Form.Label>
                    <Select
                      options={publisherOptions}
                      value={publisherOptions.find((option) => option.value === formValues.publisher) || null}
                      onChange={handleSelectChange('publisher')}
                      placeholder={i18.t("filters.publisher")}
                      isClearable
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={3}>
                  <Form.Group controlId="printingOffice">
                    <Form.Label>{i18.t("edit.bookPrintingOffice")}</Form.Label>
                    <Select
                      options={officeOptions}
                      value={officeOptions.find((option) => option.value === formValues.printingOffice) || null}
                      onChange={handleSelectChange('printingOffice')}
                      placeholder={i18.t("edit.bookPrintingOffice")}
                      isClearable
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={3}>
                  <Form.Group controlId="fontType">
                    <Form.Label>{i18.t("filters.fontType")}</Form.Label>
                    <Select
                      options={fontTypeOptions}
                      value={fontTypeOptions.find((option) => option.value === formValues.fontType) || null}
                      onChange={handleSelectChange('fontType')}
                      placeholder={i18.t("filters.fontType")}
                      isClearable
                    />
                  </Form.Group>
                </Col>

              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button variant="dark" onClick={handleReset} className="me-2">
                  {i18.t("filters.clear")}
                </Button>
                <Button className="btn-orange" type="submit">
                  {i18.t("filters.search")}
                </Button>
              </div>
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default FiltrosDropdown;
