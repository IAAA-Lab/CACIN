import React, { useEffect, useState } from 'react';
import { FiArrowDown, FiCalendar, FiFileText, FiPenTool } from 'react-icons/fi';
import { GrLocation, GrLocationPin } from 'react-icons/gr';
import { PiIdentificationCard } from 'react-icons/pi';
import { getOfficeFontTypes } from '../services/OfficeServices';
import { getFontTypesById } from '../services/FontTypeServices';
import i18 from '../i18n/i18';
import Tiff from 'tiff.js';

function OfficeInfoComponent({ office }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontTypes, setFontTypes] = useState([]);
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const officeFonts = await getOfficeFontTypes();
        const filteredFonts = officeFonts.filter(font => font.office_id === office.id);

        const fetchedFonts = await Promise.all(
          filteredFonts.flatMap(font =>
            font.fontType_id.map(async fontId => await getFontTypesById(fontId))
          )
        );

        setFontTypes(fetchedFonts);
        console.log('fetchedFonts', fetchedFonts);

      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchFonts();
  }, [office]);

  // Tratamiento de imagenes del alfabeto
  const images = require.context('../assets/alphabetImages', true);
  const imageList = images.keys().map(image => ({
    path: image,
    src: images(image)
  }));

  // Filtrar las imágenes del imageList que coincidan con los valores de alphabetImage
  useEffect(() => {
    const filteredImages = imageList.filter(image => {
      const imageName = image.path.replace('./', '');
      return fontTypes.map(font => font.alphabetImage).includes(imageName);
    });

    // Cargar las imágenes TIFF filtradas y generar las URLs
    filteredImages.forEach((image, index) => {
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.open('GET', image.src, true);

      xhr.onload = function (e) {
        var arraybuffer = this.response;
        Tiff.initialize({ TOTAL_MEMORY: 16777216 * 10 });
        var tiff = new Tiff({ buffer: arraybuffer });
        var dataUri = tiff.toDataURL();

        // Guardar las URLs TIFF en el estado con su nombre de archivo como clave
        setImageUrls(prevUrls => ({
          ...prevUrls,
          [image.path.replace('./', '')]: dataUri
        }));
      }

      xhr.send();
    });
  }, [fontTypes, imageList]);

  const mapUrl = office?.location
    ? `https://www.google.com/maps?q=${encodeURIComponent(office.location)}&output=embed`
    : '';

  if (loading) return null;
  if (error) return null;

  return (
    <div>
      <header className="py-1 bg-light">
        <div className="container px-5 my-5">
          <div className="row gx-5">
            {/* Columna izquierda*/}
            <div className="col-lg-8">
              <div className="row">
                {office.id && (
                  <div className="col-md-6 mb-4">
                    <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                      <i className="bi bi-collection"></i>
                    </div>
                    <h2 className="h4 fw-bolder">
                      <PiIdentificationCard className="mb-1 me-1" />
                      {i18.t("printingOffice.id")}
                    </h2>
                    <p className="large-text">{office.id}</p>
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
              {fontTypes.length > 0 && (
                <div className="d-flex justify-content-center">
                  <a className="text-decoration-none" href="#fonType">
                    {i18.t("font.info")} <FiArrowDown />
                    <i className="bi bi-arrow-right"></i>
                  </a>
                </div>
              )}
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
                <p className="large-text">
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
      </header>

      {fontTypes.length > 0 && (

        <section id="fonType">
          <div className="container px-5 my-5 d-flex justify-content-center">
            <div className="text-3xl font-semibold m-4 border-bottom">
              <h2><FiPenTool /> {i18.t("font.title")}</h2>
              <p>{i18.t("font.info")}</p>
            </div>


            {fontTypes.map((font, index) => (
              <div className='container' key={font.id}>
                <h2 className="h3 mx-5 fw-bolder" htmlFor="height">
                  {font.id.toUpperCase()}
                </h2>
                <div className="row gx-5 justify-content-center text-center">
                  {font.height !== 0 && (
                    <div className="col-lg-4 mb-5 mb-lg-0">
                      <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                        <i className="bi bi-collection"></i>
                      </div>
                      <h2 className="h4 fw-bolder" htmlFor="height">
                        {i18.t("font.fontHeight")}
                      </h2>
                      <p className="large-text">{font.height}</p>
                    </div>
                  )}
                  {font.mShape && (
                    <div className="col-lg-4 mb-5 mb-lg-0">
                      <div className="feature bg-primary bg-gradient text-white rounded-3 mb-3">
                        <i className="bi bi-building"></i>
                      </div>
                      <h2 className="h4 fw-bolder" htmlFor="mShape">
                        {i18.t("font.mShape")}
                      </h2>
                      <p className="large-text">{font.mShape}</p>
                    </div>
                  )}
                </div>
                {font.alphabetImage && (
                  <div className="d-flex justify-content-center">
                    <img
                      src={imageUrls[font.alphabetImage] || ""}
                      alt={font.alphabetImage}
                      style={{ height: '50vh', width: 'auto' }}
                      className="d-flex justify-content-center"
                    />
                  </div>
                )}

                
                {index < fontTypes.length - 1 && (
                  <hr className='m-5' />
                )}

              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default OfficeInfoComponent;

