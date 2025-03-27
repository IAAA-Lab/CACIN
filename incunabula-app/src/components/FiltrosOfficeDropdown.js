import React, { useState } from 'react';
import { Accordion, Form, Button, Row, Col } from 'react-bootstrap';
import i18 from '../i18n/i18';
import Select from 'react-select';

const FiltrosOfficeDropdown = ({
  onApplyFilters,
  locationOptions = [],
  foundedYearOptions = [],
  closedYearOptions = []
}) => {
  const [formValues, setFormValues] = useState({
    location: null,
    foundedYear: null,
    closedYear: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilters(formValues); // Notificar los filtros seleccionados
  };

  const handleReset = () => {
    const resetValues = {
      location: null,
      foundedYear: null,
      closedYear: null
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
                <Col md={6} lg={4}>
                  <Form.Group controlId="location">
                    <Form.Label>{i18.t("printingOffice.location")}</Form.Label>
                    <Select
                      options={locationOptions}
                      value={locationOptions.find((option) => option.value === formValues.location) || null}
                      onChange={handleSelectChange('location')}
                      placeholder={i18.t("printingOffice.location")}
                      isClearable
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4}>
                  <Form.Group controlId="foundedYear">
                    <Form.Label>{i18.t("printingOffice.foundedYear")}</Form.Label>
                    <Select
                      options={foundedYearOptions}
                      value={foundedYearOptions.find((option) => option.value === formValues.foundedYear) || null}
                      onChange={handleSelectChange('foundedYear')}
                      placeholder={i18.t("printingOffice.foundedYear")}
                      isClearable
                    />
                  </Form.Group>
                </Col>

                <Col md={6} lg={4}>
                  <Form.Group controlId="closedYear">
                    <Form.Label>{i18.t("printingOffice.closedYear")}</Form.Label>
                    <Select
                      options={closedYearOptions}
                      value={closedYearOptions.find((option) => option.value === formValues.closedYear) || null}
                      onChange={handleSelectChange('closedYear')}
                      placeholder={i18.t("printingOffice.closedYear")}
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

export default FiltrosOfficeDropdown;
