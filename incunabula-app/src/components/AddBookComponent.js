import React, { useState, useEffect } from 'react';
import i18 from "../i18n/i18";
import { useLocation } from 'wouter';
import { addBook, classifyImage, getIdMayor, uploadImageToCloudflare } from '../services/IncunabulaServices';
import { getOffices, getOfficeFontTypes } from '../services/OfficeServices';
import { getFontTypes } from '../services/FontTypeServices';
import { Button } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { ClipLoader } from "react-spinners";
import ImageUploader from './ImageUploader';
import Select from 'react-select';
import AddModal from './AddModal';
import OfficeOptions from './OfficeOptions';
import OfficeCarousel from './OfficeCarousel';

const AddBook = () => {
  const [book, setBook] = useState(null);
  const [, setLocation] = useLocation();
  const [modalShow, setModalShow] = useState(false);
  const [idBook, setIdBook] = useState(null);
  const [error, setError] = useState(null);

  const [fontCount, setFontCount] = useState(1);
  const [fontData, setFontData] = useState([]);

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fontTypeOptions, setFontTypeOptions] = useState([]);
  const [offices, setOffices] = useState([]);
  const [officeOptions, setOfficeOptions] = useState([]);
  const [recognitionCompleted, setRecognitionCompleted] = useState(false);


  const [officeFonts, setOfficeFonts] = useState([]);

  const [fileError, setFileError] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSelected, setFileSelected] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [foundedYear, setFoundedYear] = useState(null);
  const [closedYear, setClosedYear] = useState(null);


  useEffect(() => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreviewUrl(imageUrl);
      console.log('Image Preview URL:', imageUrl); // Add this to check the URL in the console

      return () => {
        URL.revokeObjectURL(imageUrl); // Clean up URL object
      };
    }

    const fetchPrintingOffices = async () => {
      try {
        const offices = await getOffices();
        setOffices(offices);
        const officeOptions = [
          { value: null, label: i18.t("edit.selectPrintingOffice") },
          ...(offices || []).map(office => ({
            value: office.id,
            label: office.id
          }))
        ];
        setOfficeOptions(officeOptions);
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

    fetchPrintingOffices();
    fetchFontTypes();
    fetchOfficeFontTypes();
  }, [file]);

  const handleAdd = async (e) => {
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

    bookData.printingOffice = book?.printingOffice?.value || '';
    bookData.fontTypes = book?.fontTypes || [];
    bookData.date = book?.date|| null;
  
    try {
      const newBookId = await getIdMayor();
      console.log("Assigned Book ID: ", newBookId); // this is the place of the ID 
      bookData.id = newBookId + 1;
      
      // Subir archivo a Cloudflare R2
      if (file) {
        try {
          const imageUrl = await uploadImageToCloudflare(file, bookData.id);
          bookData.imageUrl = imageUrl;
        } catch (error) {
          setError("Error uploading the image");
          setLoading(false);
          return;
        }
      }
  
      // Llamar a la API para añadir el libro, pasando la URL de la imagen
      const result = await addBook(bookData);
      setIdBook(bookData.id);
      setModalShow(true);
    } catch (error) {
      alert('Failed to add book');
    } finally {
      setLoading(false);
    }
  };
  

  const handleFileChange = (file) => {
    if (file) {
      const validFormats = ['.tiff', '.tif'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validFormats.includes(fileExtension)) {
        setFileError(i18.t("edit.fileError"));
        setFileName('');
        setImagePreviewUrl(null);
      } else {
        setFileError('');
        setFileName(file.name);
        setFileSelected(file);
        setFile(file);
      }
    } else {
      setFileError('');
      setFileName('');
      setFile(null);
      setFileSelected(null);
      setImagePreviewUrl(null);
    }
  };

  const handleAutomaticRecognition = async () => {
    if (!file) {
      console.error('No file selected');
      return;
    }

    setLoading(true);
    setRecognitionCompleted(false); // Reseteamos antes del reconocimiento

    try {
      const data = await classifyImage(file);
      setResult(data);

      if (data.results && data.results.fonts) {
        const extractedFonts = data.results.fonts.map(font => {
          const url = font[1];
          const lastPart = url.substring(url.lastIndexOf('/') + 1);
          return {
            value: lastPart,
            label: lastPart,
          };
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

        setRecognitionCompleted(true); // Reconocimiento completado con éxito
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
      location: selectedOffice?.location || ''
    }));
  
    setFoundedYear(selectedOffice?.foundedYear);
    setClosedYear(selectedOffice?.closedYear);
  }; 

  const handleOfficeSelect = (selectedOffice) => {
    const officeId = selectedOffice?.id;
    const filteredFontTypes = fontData[selectedOffice?.id] || [];

    // Actualizamos el estado del libro con la oficina seleccionada
    setBook((prevBook) => ({
      ...prevBook,
      publisher: selectedOffice?.officeName || '',
      location: selectedOffice?.location || '',
      printingOffice: officeOptions.find((office) => office.value === officeId) || null,
      fontTypes: []
    }));
    setFoundedYear(selectedOffice?.foundedYear);
    setClosedYear(selectedOffice?.closedYear);
    setFontTypeOptions(filteredFontTypes);
  }

  const fontTypeFilteredOptions = [
    { value: null, label: i18.t("edit.selectFontType") },
    ... (fontTypeOptions)
  ];

  const handleSelectChange = (selectedOption) => {
    const filteredFontTypes = fontData[selectedOption.value] || [];
    setError(null);
    setBook(prevBook => ({
      ...prevBook,
      printingOffice: selectedOption || null, // Update the selected value
      fontTypes: [] // Clear font types when changing the office
    }));
    setFoundedYear(selectedOption?.foundedYear);
    setClosedYear(selectedOption?.closedYear);
    setFontTypeOptions(filteredFontTypes);
  };

  const handleFontCountChange = (e) => {
    setFontCount(parseInt(e.target.value, 10));
  };

  const handleSelectFontChange = (selectedOption, index) => {

    try {
      setError(null);

      if (!book || !book.fontTypes) {
        throw new Error('Font types data is missing');
      }

      const selectedFont = selectedOption ? selectedOption.value : null;

      // Verifica si book.fontTypes es un array
      if (!Array.isArray(book.fontTypes)) {
        console.error('book.fontTypes is not an array:', book.fontTypes);
        return;
      }

      const updatedFontTypes = [...book.fontTypes];
      updatedFontTypes[index] = selectedFont;

      setBook({ ...book, fontTypes: updatedFontTypes });

    } catch (error) {
      console.error('Error in handleSelectFontChange:', error);
      // Aquí puedes mostrar el mensaje de error al usuario
      setError(i18.t("edit.errorSelectFont"));
    }

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

  return (
    <div>
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
        `}
      </style>

      <Form onSubmit={handleAdd}>
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
                      disabled={loading || !file}
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

              </div>
            </div>

            <div class="col-lg-6">
              <div className="book-form">
                <div className="form-group">
                  <div className="form-group-left">
                    <Form.Group controlId="title">
                      <Form.Label>{i18.t("edit.bookTitle")}</Form.Label>
                      <Form.Control type="text" name="title" required placeholder={`${i18.t("edit.bookTitle")}...`} />
                    </Form.Group>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-group-left">
                    <Form.Group controlId="creator">
                      <Form.Label>{i18.t("edit.bookCreator")}</Form.Label>
                      <Form.Control type="text" name="creator" placeholder={`${i18.t("edit.bookCreator")}...`} />
                    </Form.Group>
                  </div>
                  <div className="form-group-right">
                    <Form.Group controlId="publisher">
                      <Form.Label>{i18.t("edit.bookPublisher")}</Form.Label>
                      <Form.Control type="text" name="publisher" placeholder={`${i18.t("edit.bookPublisher")}...`} />
                    </Form.Group>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-group-left">
                    <Form.Group controlId="date">
                      <Form.Label>{i18.t("edit.date")}</Form.Label>
                      <Form.Control type="number" min={foundedYear ? foundedYear : 1} max={closedYear} name="date" placeholder={`${i18.t("edit.date")}...`} />
                    </Form.Group>
                  </div>
                  <div className="form-group-right">
                    <Form.Group controlId="location">
                      <Form.Label>{i18.t("edit.location")}</Form.Label>
                      <Form.Control type="text" name="location" placeholder={`${i18.t("edit.location")}...`}/>
                    </Form.Group>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-group-left">
                    <Form.Group controlId="printingOffice">
                      <Form.Label>{i18.t("edit.bookPrintingOffice")}</Form.Label>
                      <Select
                        onChange={handleSelectChange}
                        options={officeOptions}
                        value={book ? book.printingOffice : null}
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
                            min="0"
                            value={fontCount}
                            onChange={handleFontCountChange}
                            style={{ width: '80px', marginLeft: '10px' }}
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
                                  book && book.fontTypes
                                    ? { value: book.fontTypes[index], label: book.fontTypes[index] }
                                    : null
                                }
                              />
                              {error && (
                                <p style={{ color: 'red', fontSize: '12px', margin: '0' }}>
                                  {error}
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

      <AddModal
        modalShow={modalShow}
        setModalShow={setModalShow}
        idBook={idBook}
        setLocation={setLocation}
      />
    </div>
  );
}

export default AddBook;
