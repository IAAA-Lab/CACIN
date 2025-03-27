import React, { useEffect, useState } from 'react';
import { getBookById, updateBook, classifyImage, uploadImageToLocalServer } from "../services/IncunabulaServices";
import { getOffices, getOfficeFontTypes } from '../services/OfficeServices';
import { getFontTypes } from '../services/FontTypeServices';
import Select from 'react-select';
import i18 from "../i18n/i18";
import { useLocation, useRoute } from 'wouter';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { ClipLoader } from "react-spinners";
import ImageUploader from '../components/ImageUploader';
import './EditBooks.css';
import { Helmet } from 'react-helmet';
import OfficeOptions from '../components/OfficeOptions';
import OfficeCarousel from '../components/OfficeCarousel';
import TiffViewer from '../components/TiffViewer';

const IMAGES_URL = process.env.REACT_APP_API_URL_IMAGES;

const EditBooks = () => {
  const [match, params] = useRoute(`${i18.language === 'es' ? '/es' : '/en'}/edit/:id`);
  const { id } = params;
  const [bookTitle, setBookTitle] = useState(null);
  const [book, setBook] = useState(null);
  const [printingOffices, setPrintingOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setLocation] = useLocation();
  const [fontCount, setFontCount] = useState(1);
  const [fileError, setFileError] = useState('');
  const [fileName, setFileName] = useState('');
  const [fontData, setFontData] = useState([]);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [fontTypeOptions, setFontTypeOptions] = useState([]);
  const [foundedYear, setFoundedYear] = useState(null);
  const [closedYear, setClosedYear] = useState(null);
  const [errorFont, setErrorFont] = useState(false);
  const [recognitionCompleted, setRecognitionCompleted] = useState(false);
  const [officeFonts, setOfficeFonts] = useState([]);



  useEffect(() => {
    const fetchBook = async () => {
      try {
        const fetchedBook = await getBookById(id);
        if (fetchedBook) {
          setBook(fetchedBook);
          setBookTitle(fetchedBook.title);
          console.log('Fetched book:', fetchedBook);

          if (fetchedBook.fontTypes) {
            setFontCount(fetchedBook.fontTypes.length);
          }
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrintingOffices = async () => {
      try {
        const offices = await getOffices();
        setPrintingOffices(offices);
        console.log('Printing offices:', offices);
      } catch (error) {
        setError(error);
      }
    };

    const fetchFontTypes = async () => {
      try {
        const fonts = await getFontTypes();
        setFontData(fonts);
      } catch (error) {
        setError(error);
      }
    }

    const fetchOfficeFontTypes = async () => {
      try {
        const officeFonts = await getOfficeFontTypes();

        const fontDataMap = {};

        officeFonts.forEach(office => {
          fontDataMap[office.office_id] = office.fontType_id.map(font => ({
            value: font,
            label: font
          }));
        });

        setFontData(fontDataMap);
      } catch (error) {
        setError(error);
      }
    };


    fetchBook();
    fetchPrintingOffices();
    fetchFontTypes();
    fetchOfficeFontTypes();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    setLoading(true);

    const formData = new FormData(e.target);
    const bookData = {};

    formData.forEach((value, key) => {
      if (key.includes('fontType')) {
        const fontIndex = parseInt(key.replace('fontType', ''), 10);
        if (!bookData['fontTypes']) {
          bookData['fontTypes'] = [];
        }
        bookData['fontTypes'][fontIndex] = value;
      } else {
        bookData[key] = value;
      }
    });

    // Asegurando que los campos printingOffice y fontTypes se actualicen correctamente
    bookData.printingOffice = book.printingOffice?.value;
    bookData.fontTypes = book.fontTypes;

    // Subir archivo a Cloudflare R2
    //if (file) {
      //try {
        //const imageUrl = await uploadImageToCloudflare(file, id);
        //bookData.imageUrl = imageUrl;
      //} catch (error) {
        //setError("Error uploading the image");
        //setLoading(false);
        //return;
      //}
    //}

    if (file) {
      try {
        const imageUrl = await uploadImageToLocalServer(file, id);
        bookData.imageUrl = imageUrl;
      } catch (error) {
        setError("Error uploading the image");
        setLoading(false);
        return;
      }
    }

    updateBook(id, bookData)
      .then(() => {
        setLocation(`${i18.language === 'es' ? '/es' : '/en'}/${id}`);
      })
      .catch(() => {
        alert('Failed to update book');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFileChange = (file) => {
    if (file) {
      const validFormats = ['.tiff', '.tif'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validFormats.includes(fileExtension)) {
        setFileError(i18.t("edit.fileError"));
        setFileName('');
        setFile(null);
      } else {
        setFileError('');
        setFileName(file.name);
        setFile(file);
      }
    } else {
      setFileError('');
      setFileName('');
      setFile(null);
    }
  };

  const handleAutomaticRecognition = async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }

    setLoading(true);
    setRecognitionCompleted(false);

    try {
      const data = await classifyImage(file);
      setResult(data);

      if (data.results && data.results.fonts) {
        const extractedFonts = data.results.fonts.map(font => {
          const url = font[1];
          const lastPart = url.substring(url.lastIndexOf('/') + 1);
          return lastPart;
        });

        const officeIds = extractedFonts.map(extractedFont => {
          let result = null;

          Object.keys(fontData).forEach(office_id => {
            const fontMatch = fontData[office_id].find(item => item.value === extractedFont.value);
            if (fontMatch) {
              result = { office_id: office_id, font_id: fontMatch.value };
            }
          });

          return result;
        });

        console.log(officeFonts);
        setOfficeFonts(officeIds);

        setRecognitionCompleted(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (selectedOffice, selectedFontIds) => {
    const officeId = selectedOffice?.id;
  
    if (!selectedFontIds || selectedFontIds.length === 0) {
      console.error('No font types selected');
      return;
    }
  
    const fontCountValue = Array.isArray(selectedFontIds) ? selectedFontIds.length : 1;
    setFontCount(fontCountValue);
  
    setBook((prevBook) => ({
      ...prevBook,
      publisher: selectedOffice?.officeName || '',
      printingOffice: officeOptions.find((office) => office.value === officeId) || null,
      fontTypes: selectedFontIds,
      location: selectedOffice?.location
    }));
  
    setFoundedYear(selectedOffice?.foundedYear);
    setClosedYear(selectedOffice?.closedYear);
  }; 

  const officeOptions = [
    { value: null, label: i18.t("edit.selectPrintingOffice") },
    ...(printingOffices || []).map(office => ({
      value: office.id,
      label: office.id
    }))
  ];

  const fontTypeFilteredOptions = fontTypeOptions.map((fontType) => ({
    value: fontType.id,
    label: fontType.id,
  }));
  

  const handleOfficeSelect = (selectedOffice) => {
    const officeId = selectedOffice?.id;
    const filteredFontTypes = fontData[selectedOffice?.id] || [];

    // Actualizamos el estado del libro con la oficina seleccionada
    setBook((prevBook) => ({
      ...prevBook,
      publisher: selectedOffice?.officeName || '',
      printingOffice: officeOptions.find((office) => office.value === officeId) || null,
      fontTypes: []
    }));
    setFoundedYear(selectedOffice?.foundedYear);
    setClosedYear(selectedOffice?.closedYear);
    setFontTypeOptions(filteredFontTypes);
  }

  const handleSelectChange = (selectedOption) => {
    if (!selectedOption) {
      console.warn('No office selected');
      return;
    }
  
    const selectedOfficeId = selectedOption.value;
    const filteredFontTypes = fontData[selectedOfficeId] || [];
  
    console.log('Selected office:', selectedOption);
    console.log('Filtered font types:', filteredFontTypes);
  
    // Actualiza el estado del libro y las opciones de fuentes
    setBook((prevBook) => ({
      ...prevBook,
      printingOffice: selectedOption,
      fontTypes: []
    }));
    setFontTypeOptions(filteredFontTypes);
  };

  const handleSelectFontChange = (selectedOption, index) => {
    const selectedFont = selectedOption ? selectedOption.value : null;
  
    const updatedFontTypes = [...book.fontTypes];
    updatedFontTypes[index] = selectedFont;
  
    setBook({ ...book, fontTypes: updatedFontTypes });
  };

  const handleFontCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setFontCount(count);
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };

  const bodyStyle = loading
    ? { overflow: "hidden" }
    : {};

  if (loading) return null;
  if (error) return null;

  return (
    <div>
      <Helmet>
        <title>{i18.t("edit.title")}</title>
      </Helmet>

      {loading && (
        <div style={overlayStyle}>
          <ClipLoader size={60} color={"#ECB289"} loading={loading} />
        </div>
      )}

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

          .button-loader-container {
            display: flex;
            align-items: center;
            gap: 10px; /* Space between items */
            position: relative; /* Ensures absolute positioning within this container */
          }

        `}
      </style>

      <div className="container pt-4 mb-4 text-3xl font-semibold  border-bottom">
        <div className="text-3xl font-semibold">
          <h1>{i18.t("edit.title")}</h1>
          <p>{i18.t("edit.info")} "<span style={{ fontWeight: 'bold', fontSize: 'larger' }}>{bookTitle}</span>"</p>
        </div>
      </div>

      {book && (
        <Form onSubmit={handleUpdate}>
          <div className="container pt-1 mb-2">
            <ul class="flex justify-content-end me-4">
              <Button className="me-2" variant='white' type="button" onClick={() => setLocation(`${i18.language === 'es' ? '/es' : '/en'}/editDelete`)}>{i18.t("cancel")}</Button>
              <Button variant='orange' type="submit">{i18.t("save")}</Button>
            </ul>
          </div>

          <div className="container">
            <div class="row gy-4 justify-content-between">
              <div class="col-lg-6">

                <div className="book-form">
                  <div className="form-group">
                    <Form.Group controlId="file">
                      <Form.Label>{i18.t("edit.file")}</Form.Label>
                      <ImageUploader onFileChange={handleFileChange} loading={loading} />
                    </Form.Group>
                  </div>

                  <div className="button-loader-container">
                    {file && (
                      <Button
                        variant="orange"
                        type="button"
                        onClick={handleAutomaticRecognition}
                        disabled={!file}
                      >
                        {i18.t("edit.automaticRecognition")}
                      </Button>
                    )}
                  </div>

                  {file && !loading && recognitionCompleted &&
                    <>
                      <OfficeOptions className="m-2" officeFonts={officeFonts} handleOptionSelect={handleOptionSelect} />
                      <p></p>
                    </>
                  }

{book.file && (
  book.file.endsWith('.tiff') ? (  // Check if the file is a TIFF
    <div className="tiff-frame">
      <TiffViewer fileUrl={`${IMAGES_URL}${book.file}`} />
    </div>
  ) : book.file.endsWith('.pdf') ? (  // Check if the file is a PDF
    <iframe
      src={book.file}
      title="Preview"
      className="iframe"
    />
  ) : (  // Handle unsupported formats
    <p>File format not supported for preview</p>
  )
)}
                </div>
              </div>


              <div class="col-lg-6">
                <div className="book-form">
                  <div className="form-group">
                    <div className="form-group-left">
                      <Form.Group controlId="title">
                        <Form.Label>{i18.t("edit.bookTitle")}</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          required
                          value={book.title}
                          onChange={(e) => setBook({ ...book, title: e.target.value })}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-group-left">
                      <Form.Group controlId="creator">
                        <Form.Label>{i18.t("edit.bookCreator")}</Form.Label>
                        <Form.Control
                          type="text"
                          name="creator"
                          value={book.creator}
                          onChange={(e) => setBook({ ...book, creator: e.target.value })}
                        />
                      </Form.Group>
                    </div>
                    <div className="form-group-right">
                      <Form.Group controlId="publisher">
                        <Form.Label>{i18.t("edit.bookPublisher")}</Form.Label>
                        <Form.Control
                          type="text"
                          name="publisher"
                          value={book.publisher}
                          onChange={(e) => setBook({ ...book, publisher: e.target.value })}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="form-group">
                  <div className="form-group-left">
                    <Form.Group controlId="date">
                      <Form.Label>{i18.t("edit.date")}</Form.Label>
                      <Form.Control 
                        type="number" 
                        min={foundedYear ? foundedYear : 1} 
                        max={closedYear} 
                        name="date" 
                        value={book.date} 
                        onChange={(e) => setBook({ ...book, date: e.target.value })}
                        />
                    </Form.Group>
                  </div>
                  <div className="form-group-right">
                    <Form.Group controlId="location">
                      <Form.Label>{i18.t("edit.location")}</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="location" 
                        value={book.location}
                        onChange={(e) => setBook({ ...book, location: e.target.value })}
                        />
                    </Form.Group>
                  </div>
                </div>

                  <div className="form-group">
                    <div className="form-group-left">
                      <Form.Group controlId="printingOffice">
                        <Form.Label>{i18.t("edit.bookPrintingOffice")}</Form.Label>
                        <Select
                          value={
                            book.printingOffice
                              ? { value: book.printingOffice.value, label: book.printingOffice.label }
                              : null
                          }
                          onChange={handleSelectChange}
                          options={officeOptions}
                          placeholder={i18.t("edit.selectPrintingOffice")}
                        />
                      </Form.Group>
                      <OfficeCarousel handleOfficeSelect={handleOfficeSelect} />

                    </div>
                    <div className="form-group-right">
                      <div className="flex-container">
                        <Form.Group as={Row} controlId="fontType">
                          <Form.Label column>{i18.t("edit.bookFontType")}</Form.Label>
                          <Col>
                            <Form.Control
                              size="sm"
                              type="number"
                              value={fontCount}
                              min="0"
                              onChange={handleFontCountChange}
                              style={{ width: '80px', marginLeft: '10px', marginBottom: '10px' }}
                            />
                          </Col>
                        </Form.Group>
                      </div>
                      <p></p>
                      {fontCount > 0 && (
                        [...Array(fontCount)].map((_, index) => (
                          <div key={index} className="form-group">
                            <Form.Group as={Row} controlId={`fontType${index}`}>
                              <Form.Label column sm={1}>{`${index + 1}.`}</Form.Label>
                              <Col>
                                <Select
                                  onChange={(selectedOption) => handleSelectFontChange(selectedOption, index)}
                                  options={fontTypeFilteredOptions}
                                  placeholder={i18.t("edit.selectFontType")}
                                  value={
                                    book.fontTypes && book.fontTypes[index]
                                      ? { value: book.fontTypes[index].id, label: book.fontTypes[index].id }
                                      : null
                                  }
                                />

                                {error && (
                                <p style={{ color: 'red', fontSize: '12px', margin: '0' }}>
                                  {i18.t("edit.errorSelectFont")}
                                </p>
                              )}
                              </Col>
                            </Form.Group>
                          </div>
                        ))
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form>
      )}

    </div>

  );
};

export default EditBooks;
