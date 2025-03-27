import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
const API_URL_AR = process.env.REACT_APP_API_URL_AR;


export const getBooks = async () => {
  const response = await axios.get(`${API_URL}books/`);
  return response.data;
};

export const countBooks = async () => {
  // Mediante getBooks() obtenemos todos los libros y contamos su longitud
  const books = await getBooks();
  return books.length;
};

export const getIdMayor = async () => {
  const books = await getBooks();
  let idMayor = 0;

  books.forEach(book => {
    if (parseInt(book.id) > idMayor) {
      idMayor = parseInt(book.id);
    }
  });
  return idMayor;
}

export const deleteIncunabula = async (bookId) => {
  const response = await axios.delete(`${API_URL}books/${bookId}/`,
    {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  return response.data;
};

export const getBookById = async (bookId) => {
  const response = await axios.get(`${API_URL}books/${bookId}/`);
  return response.data;
};

export const updateBook = async (bookId, bookData) => {
  const response = await axios.put(`${API_URL}books/${bookId}/`, {
    id: bookId,
    title: bookData.title,
    creator: bookData.creator,
    publisher: bookData.publisher,
    printingOffice: bookData.printingOffice,
    fontTypes: bookData.fontTypes,
    file: bookData.imageUrl,
    location: bookData.location,
    date: bookData.date
  });
  return response.data;
};


export const addBook = async (bookData) => {
  console.log('BookData', bookData);
  const response = await axios.post(`${API_URL}books/`, {
    id: bookData.id,
    title: bookData.title,
    creator: bookData.creator,
    publisher: bookData.publisher,
    printingOffice: bookData.printingOffice,
    fontTypes: bookData.fontTypes,
    file: bookData.imageUrl,
    location: bookData.location,
    date: bookData.date
  });
  return response.data;
};

export const uploadImageToCloudflare = async (file, id) => {
  try {
    const formdata = new FormData();
    formdata.append("file", file, id);
    formdata.append("id", id);
    const requestOptions = {
      method: "POST",
      body: formdata,
    };

    const response = await axios.post(`${API_URL}generate-upload-url/`, formdata);
    return response.data.key;    
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};


//export const uploadImageToLocalRepo = async (file, id) => {
  //try {
    //const formData = new FormData();
    //formData.append("file", file);
    //formData.append("id", id);

    //const response = await axios.post('/api/local-upload', formData); // Adjust endpoint as needed
    //return response.data.filePath; // Return the file path or URL from the response
  //} catch (error) {
    //console.error("Error uploading image locally:", error);
    //throw error;
  //}
//};


export const uploadImageToLocalServer = async (file, id) => {
  const formData = new FormData();
  formData.append("file", file);  // Append the image file to the FormData object
  formData.append("id", id);      // Append the ID to the FormData object

  try {
    // Send a POST request to the backend API to upload the file
    const response = await fetch(`${API_URL}generate-upload-url/`, {
      method: "POST",        // Use POST method for file upload
      body: formData,        // Attach the FormData containing the file
    });

    // Check if the response is not OK (i.e., status is not in the range 200-299)
    if (!response.ok) {
      throw new Error("Failed to upload image to the local server");
    }

    // Parse the response body as JSON to get the data
    const data = await response.json();

    // Return the key or URL of the uploaded file (depending on how your backend responds)
    return data;
  } catch (error) {
    // Log the error if the upload fails
    console.error("Error uploading file:", error);
    throw error;  // Rethrow the error to be handled by the caller
  }
};




export const classifyImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(API_URL_AR, formData);
  return response.data;
};
