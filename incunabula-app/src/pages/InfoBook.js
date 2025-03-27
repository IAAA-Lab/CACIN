import React, { useEffect, useState } from 'react';
import { getBookById } from "../services/IncunabulaServices";
import i18 from "../i18n/i18";
import { useLocation, useRoute } from 'wouter';
import Button from 'react-bootstrap/Button';
import { FiCalendar, FiEdit, FiFileText } from 'react-icons/fi';
import { PiBuildingOffice } from 'react-icons/pi';
import ImageModal from '../components/ImageModal';
import OfficeModal from '../components/OfficeModal';
import './EditBooks.css';
import DeleteIncunabulaModal from '../components/DeleteIncunabulaModal';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import useUser from '../hooks/useUser';
import { GrLocation, GrLocationPin } from 'react-icons/gr';
import TiffViewer from '../components/TiffViewer';

const IMAGES_URL = process.env.REACT_APP_API_URL_IMAGES;

const InfoBook = () => {
  const [, params] = useRoute(`${i18.language === 'es' ? '/es' : '/en'}/:id`);
  const { id } = params;
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useUser();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const fetchedBook = await getBookById(id);
        setBook(fetchedBook);
        console.log('fetchedBook', fetchedBook);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleDeleteSuccess = () => {
    setLocation(`${i18.language === 'es' ? '/es' : '/en'}/editDelete`);
  };

  const mapUrl = book?.location
    ? `https://www.google.com/maps?q=${encodeURIComponent(book.location)}&output=embed`
    : '';

  if (loading) return null;
  if (error) return null;

  return (
    <div>
      <Helmet>
        <title>{book.title}</title>
      </Helmet>

      <style type="text/css">
        {`
          .btn-orange {
            background-color: #ECB289;
            color: black;
            border: 1px solid;
            border-radius: 5px;
          }
          .title-text {
            width: 80%;
            font-size: 2rem;
            font-weight: bold;
          }
          .edit-button {
            width: 20%;
            margin: 2rem;
            display: flex;
            justify-content: center;
            gap: 1rem;
          }
                    .tiff-frame {
            width: 100%;
            border: 1px solid #ccc; /* Optional: Border around TIFF viewer */
            padding: 10px;
            overflow: hidden;
          }
        `}
      </style>

      <div className="container pt-4 mb-4 border-bottom">
        <div className="row gx-5 align-items-center justify-content-center">
          <div className="col-lg-8 col-xl-7 col-xxl-6">
            <div className="text-xl-start">
              <div className="title-text">
                <h1>{book.title}</h1>
              </div>
              <p>{i18.t("incunabula.info")}</p>
            </div>
          </div>

          <div className="col-xl-5 col-xxl-6 d-none d-xl-block text-center">
            {isLoggedIn &&
              <div>
                <Button className="me-4" variant="orange" onClick={() => setLocation(`${i18.language === 'es' ? '/es' : '/en'}/edit/${id}`)}>
                  <FiEdit className="fi-edit me-2" />
                  {i18.t("editButton")}
                </Button>

                <DeleteIncunabulaModal bookToDelete={id} onDeleteSuccess={handleDeleteSuccess} />
              </div>
            }
          </div>

        </div>
      </div>

<div className="container px-5 my-1">
  <div className="row gx-5">
    {book.file && (
      book.file.endsWith('.tiff') ? (  // Check if the URL ends with '.tiff'
       <div className="tiff-frame">
          <TiffViewer fileUrl={`${IMAGES_URL}${book.file}`} />
        </div>
      ) : book.file.endsWith('.pdf') ? (  // Check if the URL ends with '.pdf'
        <iframe
          src={book.file}
          title="Preview"
          className="iframe"
        />
      ) : (  // Handle unsupported formats
        <p>File format not supported for preview</p>
      )
    )}  

          <div className="col-lg-6">
            <div className="d-flex flex-wrap align-items-start">
              {book.creator && (
                <div className="mb-4 me-4 mt-4">
                  <h2 className="h4 fw-bolder">
                    <FiFileText className="mb-1 me-1" />
                    {i18.t("edit.bookCreator")}
                  </h2>
                  <p className="large-text">{book.creator}</p>
                </div>
              )}

              {book.publisher && (
                <div className="mb-4 me-4 mt-4">
                  <h2 className="h4 fw-bolder">
                    <FiFileText /> {i18.t("edit.bookPublisher")}
                  </h2>
                  <p className="large-text">{book.publisher}</p>
                </div>
              )}

              {book.printingOffice && (
                <div className="mb-4 me-4 mt-4">
                  <h2 className="h4 fw-bolder">
                    <PiBuildingOffice /> {i18.t("edit.bookPrintingOffice")}
                  </h2>
                  <OfficeModal book={book} />
                </div>
              )}

              {book.fontTypes.length !== 0 && (
                <div className="mb-4 me-4 mt-4">
                  <h2 className="h4 fw-bolder">
                    {i18.t("edit.bookFontType")}
                  </h2>
                  {Array.isArray(book.fontTypes) && book.fontTypes.map((font, index) => (
                    <p className="large-text" key={index}>
                      <Link href={`${i18.language === 'es' ? '/es' : '/en'}/fontType/${font.id}`}>
                        {font.id}
                      </Link>
                    </p>
                  ))}
                </div>
              )}

              {book.date && (
                <div className="mb-4 me-4 mt-4">
                  <h2 className="h4 fw-bolder">
                    <FiCalendar /> {i18.t("edit.date")}
                  </h2>
                  <p className="large-text">{book.date}</p>
                </div>
              )}
            </div>
          </div>

          {book.location && (
            <div className="col-lg-4 d-flex flex-column justify-content-start mt-4">
              <h2 className="h4 fw-bolder">
                <GrLocation /> {i18.t("edit.location")}
              </h2>
              <p className="large-text">
                <GrLocationPin color="red" /> {book.location}
              </p>
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
          )}
        </div>
      </div>
    </div >
  );
};

export default InfoBook;
