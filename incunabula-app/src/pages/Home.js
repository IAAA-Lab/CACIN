import React, { useState, useEffect } from 'react';
import i18 from '../i18n/i18';
import { useLocation } from 'wouter';
import { addBook, classifyImage, getIdMayor } from '../services/IncunabulaServices';
import { getOffices, getOfficeFontTypes } from '../services/OfficeServices';
import { getFontTypes } from '../services/FontTypeServices';
import { Button } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { ClipLoader } from 'react-spinners';
import ImageUploader from '../components/ImageUploader';
import Select from 'react-select';
import AddModal from '../components/AddModal';
import OfficeOptions from '../components/OfficeOptions';
import OfficeCarousel from '../components/OfficeCarousel';
import TiffViewer from '../components/TiffViewer';

const IMAGES_URL = process.env.REACT_APP_API_URL_IMAGES;


const Home = () => {
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
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [fileSelected, setFileSelected] = useState(null);



  useEffect(() => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreviewUrl(imageUrl);

      return () => {
        URL.revokeObjectURL(imageUrl); // Clean up URL object
      };
    }
  }, [file]);

  // const handleAdd = async (e) => {
  //   e.preventDefault();

  //   // Crear un objeto para los datos del libro
  //   const bookData = {};

  //   // Crear un FormData solo para facilitar la recolección de datos del formulario
  //   const formData = new FormData(e.target);

  //   // Recorrer los valores del formulario y asignar los datos a bookData
  //   formData.forEach((value, key) => {
  //     if (key.includes('fontType')) {
  //       const fontIndex = parseInt(key.replace('fontType', ''), 10);
  //       if (!bookData['fontTypes']) {
  //         bookData['fontTypes'] = [];
  //       }
  //       bookData['fontTypes'][fontIndex] = value;
  //     } else {
  //       bookData[key] = value;
  //     }
  //   });

  //   // Asegurarse de que la oficina de impresión y tipos de fuentes se asignan correctamente
  //   bookData.printingOffice = book?.printingOffice?.value || formData.get('printingOffice') || '';
  //   bookData.fontTypes = book?.fontTypes || bookData.fontTypes || [];

  //   try {
  //     // Obtener el nuevo ID para el libro
  //     const newBookId = await getIdMayor();
  //     bookData.id = newBookId + 1;

  //     // Convertir el archivo a base64 si se ha seleccionado una imagen
  //     if (fileSelected) {
  //       const fileReader = new FileReader();
  //       fileReader.readAsDataURL(fileSelected);

  //       fileReader.onloadend = async () => {
  //         try {
  //           const base64Image = fileReader.result; // Obtener la imagen codificada en base64

  //           // Asegurarnos de que enviamos la imagen en el campo 'file', como lo espera la función addBook
  //           bookData.file = base64Image; // Añadir la imagen codificada en base64 al objeto bookData en el campo 'file'

  //           console.log("Datos del libro a añadir (incluida la imagen en base64):", bookData);

  //           // Llamar a la función addBook pasando el bookData con la imagen en base64
  //           const result = await addBook(bookData);  // Enviar bookData como objeto JSON
  //           setIdBook(bookData.id);
  //           setModalShow(true);
  //         } catch (error) {
  //           console.error('Error al procesar la imagen:', error);
  //           alert('Error al procesar la imagen');
  //         }
  //       };

  //       fileReader.onerror = (error) => {
  //         console.error('Error leyendo el archivo:', error);
  //         alert('Error al leer el archivo');
  //       };
  //     } else {
  //       // Si no hay imagen, simplemente enviar los datos sin imagen
  //       const result = await addBook(bookData);
  //       setIdBook(bookData.id);
  //       setModalShow(true);
  //     }

  //   } catch (error) {
  //     console.error('Error al añadir el libro:', error);
  //     alert('Failed to add book');
  //   }
  // };

  const handleAdd = async (e) => {
    e.preventDefault();

    // Crear un objeto FormData
    const formData = new FormData();
    const bookData = {}

    // Agregar los campos del formulario al FormData
    formData.append('id', bookData?.id);
    formData.append('title', bookData?.title);
    formData.append('creator', bookData?.creator);
    formData.append('publisher', bookData?.publisher);
    formData.append('printingOffice', bookData?.printingOffice);
    formData.append('fontTypes', JSON.stringify(bookData?.fontTypes)); // Si es un array, puedes convertirlo a string
    formData.append('location', bookData?.location);

    // Si hay un archivo seleccionado
    if (file) {
      formData.append('file', file);  // El archivo se añade aquí
    }

    try {
      // Llamar a la función addBook y pasar el FormData
      const result = await addBook(formData);
      console.log("Libro añadido con éxito:", result);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      alert("Error al procesar la imagen");
    }
  };



  const handleFileChange = (file) => {
    if (file) {
      // const validFormats = ['.tiff', '.tif'];
      // const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      // if (!validFormats.includes(fileExtension)) {
      // setFileError(i18.t('edit.fileError'));
      // setFileName('');
      // setImagePreviewUrl(null);
      // } else {
      setFileError('');
      setFileName(file.name);
      setFileSelected(file);
      setFile(file);
      // }
    } else {
      setFileError('');
      setFileName('');
      setFile(null);
      setFileSelected(null);
      setImagePreviewUrl(null);
    }
  };
  const fileUrl = 'https://pub-de5ea36c6de64100ab4df9fb90a37741.r2.dev/0002.tif';

  return (

<div className="contact-us-container">
      <h1 className="contact-us-title">{i18.t('home.title')}</h1>

      <div className="contact-us-content">
        {/* Paragraph 1 */}
        <p className="contact-us-paragraph">{i18.t('home.welcome')}</p>

      {/* Paragraph 3 */}
        <p className="contact-us-paragraph">
          {i18.t('contactUs.email')}{' '}
          <a href="mailto:pedraza@unizar.es" className="contact-us-link">
            {i18.t('home.emailLink')}
          </a>{' '}
          {i18.t('contactUs.emailText')}
             <a href="mailto:jnog@unizar.es" className="contact-us-link">
            {i18.t('home.emailLink2')}
          </a>{' .'}  
        </p>
        
        
        
       
     <p className="contact-us-paragraph contact-us-reference">
         
          <a href="https://youtu.be/v49EJ7qHKJ4?si=3QF0zzW1TZ758qRa" className="contact-us-link">
            {i18.t('home.media')}
          </a>
        </p>
        
        <p className="contact-us-paragraph contact-us-reference">
         
          <a href="https://github.com/IAAA-Lab/CACIN" className="contact-us-link">
            {i18.t('home.repoText')}
          </a>
        </p>
        




     {/* referencia */}
         <p className="contact-us-paragraph contact-us-reference">
          {i18.t('home.reference')}{' '}
               </p>
          {/* frase */}
        <p className="contact-us-paragraph">{i18.t('contactUs.referenceText')}
      
        {/*link */}
          <a href="https://doi.org/10.1007/s11042-022-13108-3" className="contact-us-link">
            {i18.t('home.referenceLink')}
          </a> 
           {i18.t('home.referenceText2')}
          
        </p>
  

      </div>
    </div>
  );
};


export default Home;
