import React, { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import i18 from '../i18n/i18';
import { FiPenTool, FiFileText, FiCalendar } from "react-icons/fi";
import { PiIdentificationCard } from 'react-icons/pi';
import { getOfficeById } from '../services/OfficeServices';
import { getFontTypesById } from '../services/FontTypeServices';
import { Button } from 'react-bootstrap';


function OfficeOptions({ officeFonts, handleOptionSelect }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [officesWithFonts, setOfficesWithFonts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOfficesAndFonts = async () => {
      try {
        const officeFontMap = {};

        const officePromises = officeFonts.map((font) => getOfficeById(font.office_id));
        const fetchedOffices = await Promise.all(officePromises);

        const fontPromises = officeFonts.map((font) => getFontTypesById(font.font_id));
        const fetchedFonts = await Promise.all(fontPromises);

        officeFonts.forEach((font, index) => {
          const office = fetchedOffices[index];
          const fontType = fetchedFonts[index];

          if (!officeFontMap[font.office_id]) {
            officeFontMap[font.office_id] = {
              office: office,
              fonts: []
            };
          }

          officeFontMap[font.office_id].fonts.push(fontType);
        });

        const officeFontArray = Object.values(officeFontMap);
        setOfficesWithFonts(officeFontArray);
        console.log('Offices with fonts:', officeFontArray);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (officeFonts.length > 0) {
      fetchOfficesAndFonts();
    }
  }, [officeFonts]);

  const handleSelect = () => {
    const selectedOfficeWithFonts = officesWithFonts[selectedIndex];
    
    const fonts = selectedOfficeWithFonts?.fonts || [];
  
    const fontTypeIds = Array.isArray(fonts) ? fonts.map(font => font.id) : [fonts.id];
  
    handleOptionSelect(selectedOfficeWithFonts.office, fontTypeIds);
  };
  

  const handleSelectOne = (font) => {
    const selectedOfficeWithFonts = officesWithFonts[selectedIndex];
    handleOptionSelect(selectedOfficeWithFonts.office, [font.id]);
  };

  const selectedOfficeWithFonts = officesWithFonts[selectedIndex];

  if (loading) return null;
  if (error) return <p>{i18.t("error.loading")}</p>;

  return (
    <>
      <Nav variant="tabs" activeKey={selectedIndex} onSelect={(index) => setSelectedIndex(index)}>
        {officesWithFonts.map((officeWithFonts, index) => (
          <Nav.Item key={index}>
            <Nav.Link eventKey={index} href='#fontTypes'>
              {i18.t("add.option")} {index + 1}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <Card id="fontTypes">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Card.Title>{`${i18.t("add.bookPrintingOffice")}: ${selectedOfficeWithFonts.office?.officeName}`}</Card.Title>
            <Button variant="orange" className="ms-auto" onClick={handleSelect}>
              {i18.t("select")}
            </Button>
          </div>

          <Card.Text className="mb-0">
            <div className="d-flex flex-wrap">
              {selectedOfficeWithFonts.office.id && (
                <div className="me-4">
                  <h5>
                    <PiIdentificationCard className="mb-1 me-1" />
                    {i18.t("printingOffice.id")}
                  </h5>
                  <p>{selectedOfficeWithFonts.office.id}</p>
                </div>
              )}

              {selectedOfficeWithFonts.office.alternativeName && (
                <div className="me-4">
                  <h5>
                    <FiFileText /> {i18.t("printingOffice.alternativeName")}
                  </h5>
                  <p>{selectedOfficeWithFonts.office.alternativeName}</p>
                </div>
              )}

              {selectedOfficeWithFonts.office.foundedYear && selectedOfficeWithFonts.office.closedYear && (
                <div className="me-4">
                  <h5>
                    <FiCalendar /> {i18.t("printingOffice.time")}
                  </h5>
                  <p>{selectedOfficeWithFonts.office.foundedYear} - {selectedOfficeWithFonts.office.closedYear}</p>
                </div>
              )}
            </div>
          </Card.Text>

          <Card.Title><FiPenTool /> {`${i18.t("booksTable.fontType")}:`}</Card.Title>

          <Card.Text>
            <div className="d-flex flex-column">
              {selectedOfficeWithFonts.fonts.map((font, index) => (
                <div className="d-flex justify-content-between align-items-center mb-3" key={index}>
                  <div className="d-flex">
                    <div className="me-4">
                      <h5>{i18.t("font.id")}</h5>
                      <p>{font.id}</p>
                    </div>
                    <div className="me-4">
                      <h5>{i18.t("font.fontHeight")}</h5>
                      <p>{font.height}</p>
                    </div>
                    <div className="me-4">
                      <h5>{i18.t("font.mShape")}</h5>
                      <p>{font.mShape}</p>
                    </div>
                  </div>
                  <Button variant="orange" onClick={() => handleSelectOne(font)}>
                    {i18.t("select")}
                  </Button>
                </div>
              ))}
            </div>
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
}

export default OfficeOptions;
