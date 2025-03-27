import React, { useEffect, useState, useRef } from 'react';
import i18 from "../i18n/i18";
import { FiArrowDown, FiFileText, FiCalendar } from "react-icons/fi";
import { getFontTypesById } from "../services/FontTypeServices";
import { getOfficeById } from "../services/OfficeServices";
import { GrLocation, GrLocationPin } from "react-icons/gr";
import { PiBuildingOffice } from "react-icons/pi";
import Tiff from 'tiff.js';

function FontInfoComponent({ fontId }) {
  const [font, setFont] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [office, setOffice] = useState(null);
  const imgRef = useRef(null);


  useEffect(() => {
    const fetchFont = async () => {
      try {
        const fetchedFont = await getFontTypesById(fontId);
        setFont(fetchedFont);
        console.log('fetchedFont', fetchedFont);

        // Fetch office if officeID exists
        if (fetchedFont?.officeID) {
          const fetchedOffice = await getOfficeById(fetchedFont.officeID);
          setOffice(fetchedOffice);
          console.log('fetchedOffice', fetchedOffice);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFont();
  }, [fontId]);

  const images = require.context('../assets/alphabetImages', true);
  const imageList = images.keys().map(image => ({
    path: image,
    src: images(image)
  }));

  useEffect(() => {
    if (font?.alphabetImage) {
      try {
        const alphabetImage = imageList.find(image => image.path.includes(font.alphabetImage)).src;
        console.log('alphabetImage', alphabetImage);
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.open('GET', alphabetImage, true);

        xhr.onload = function (e) {
          var arraybuffer = this.response;
          Tiff.initialize({ TOTAL_MEMORY: 16777216 * 10 });
          var tiff = new Tiff({ buffer: arraybuffer });
          var dataUri = tiff.toDataURL();
          if (imgRef.current) {
            imgRef.current.src = dataUri;
          }
        }
        xhr.send();
      } catch (error) {
        console.error('Error loading image', error);
      }
    }
  }, [font, imageList]);

  const mapUrl = office?.location
    ? `https://www.google.com/maps?q=${encodeURIComponent(office.location)}&output=embed`
    : '';

  if (loading) return null;
  if (error) return null;

  return (
    <div>
      <header className="py-5 bg-light">
        <div className="container px-5 d-flex justify-content-center">
          <div className="row gx-5 justify-content-center text-center">

            {font.height != 0 &&
              <div className="col-lg-4 mb-5 mb-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                  <i className="bi bi-collection"></i>
                </div>
                <h2 className="h4 fw-bolder" htmlFor="height">
                  {i18.t("font.fontHeight")}
                </h2>
                <p className="large-text">{font.height}</p>
              </div>
            }
            {font.mShape &&
              <div className="col-lg-4 mb-5 mb-lg-0">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                  <i className="bi bi-building"></i>
                </div>
                <h2 className="h4 fw-bolder" htmlFor="mShape">
                  {i18.t("font.mShape")}
                </h2>
                <p className="large-text">{font.mShape}</p>
              </div>
            }
            {font.officeID &&
              <div className="col-lg-4 mb-5">
                <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                  <i className="bi bi-toggles2"></i>
                </div>
                <h2 className="h4 fw-bolder" htmlFor="fontOffice">
                  {i18.t("font.fontOffice")}
                </h2>
                <p className="large-text">{font.officeID}</p>
                <a className="text-decoration-none" href="#office">
                  {i18.t("printingOffice.title")} <FiArrowDown />
                  <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            }

            {font.alphabetImage && (
              <div className="d-flex justify-content-center">
                <img
                  ref={imgRef}
                  alt={font.alphabetImage}
                  style={{ height: '45vh', width: 'auto' }}
                  className="d-flex justify-content-center"
                />
              </div>
            )}
          </div>
        </div>
      </header>
      <section className="" id="office">
        <div className="container px-5 my-5 d-flex justify-content-center">

          <div className="text-3xl font-semibold m-4 border-bottom">
            <h2><PiBuildingOffice /> {i18.t("font.fontOffice")}</h2>

            <p>{i18.t("printingOffice.title")}</p>
          </div>
          <div className="container px-5 my-1">
            <div className="row gx-5">
              {/* Columna izquierda*/}
              <div className="col-lg-8">
                <div className="row">
                  {office.officeName && (
                    <div className="col-md-6 mb-4">
                      <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                        <i className="bi bi-collection"></i>
                      </div>
                      <h2 className="h4 fw-bolder">
                        <FiFileText className="mb-1 me-1" />
                        {i18.t("printingOffice.name")}
                      </h2>
                      <p className="large-text">{office.officeName}</p>
                    </div>
                  )}

                  {office.alternativeName && (
                    <div className="col-md-6 mb-4">
                      <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                        <i className="bi bi-building"></i>
                      </div>
                      <h2 className="h4 fw-bolder">
                        <FiFileText /> {i18.t("printingOffice.alternativeName")}
                      </h2>
                      <p className="large-text">{office.alternativeName}</p>
                    </div>
                  )}
                </div>

                <div className="row">
                  {office.foundedYear && (
                    <div className="col-md-6 mb-4">
                      <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                        <i className="bi bi-toggles2"></i>
                      </div>
                      <h2 className="h4 fw-bolder">
                        <FiCalendar /> {i18.t("printingOffice.foundedYear")}
                      </h2>
                      <p className="large-text">{office.foundedYear}</p>
                    </div>
                  )}

                  {office.closedYear && (
                    <div className="col-md-6 mb-4">
                      <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                        <i className="bi bi-toggles2"></i>
                      </div>
                      <h2 className="h4 fw-bolder">
                        <FiCalendar /> {i18.t("printingOffice.closedYear")}
                      </h2>
                      <p className="large-text">{office.closedYear}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna derecha */}
              {office.location && (
                <div className="col-lg-4 d-flex flex-column justify-content-start">
                  <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                    <i className="bi bi-toggles2"></i>
                  </div>
                  <h2 className="h4 fw-bolder">
                    <GrLocation /> {i18.t("printingOffice.location")}
                  </h2>
                  <p className="large                -text">
                    <GrLocationPin color="red" /> {office.location}
                  </p>
                  <div className="d-flex justify-content-center">
                    <div className="card w-100">
                      <div className="ratio ratio-4x3">
                        <iframe
                          src={mapUrl}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Google Maps Location"
                        ></iframe>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default FontInfoComponent