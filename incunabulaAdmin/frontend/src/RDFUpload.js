import React, { useState } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import './App.css';

function RDFUpload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleFileUpload = () => {
        if (!file) {
            setMessage('Por favor, selecciona un archivo RDF.');
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("rdf_file", file);

        console.log("Uploading file:", file);

        axios.post("http://localhost:8001/api/upload_rdf/", formData)
            .then(response => {
                if (response.data.success) {
                    setMessage('Base de datos actualizada con éxito.');
                } else {
                    setMessage(`Error: ${response.data.message}`);
                }
            })
            .catch(error => {
                setMessage(`Error al subir el archivo: ${error.message}`);
            })
            .finally(() => {
                setIsUploading(false);
            });
    };

    return (
        <div className="rdf-upload">
            <h3>Poblar la base de datos</h3>
            <input type="file" onChange={handleFileChange} />
            <div style={{ marginTop: '10px' }}>
                <Button variant="primary" onClick={handleFileUpload}>Poblar base de datos</Button>
            </div>
            {message && <p>{message}</p>}

            {isUploading && (
                <div className="overlay">
                    <div className="spinner-container">
                        <Spinner animation="border" role="status" style={{ color: '#ECB289' }}/>
                        <p>Poblando base de datos</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RDFUpload;



// import React, { useState } from 'react';
// import Button from 'react-bootstrap/Button';
// import Spinner from 'react-bootstrap/Spinner';
// import './App.css';

// function RDFUpload() {
//     const [file, setFile] = useState(null);
//     const [message, setMessage] = useState('');
//     const [isUploading, setIsUploading] = useState(false);

//     const handleFileChange = (event) => {
//         setFile(event.target.files[0]);
//     };

//     const handleFileUpload = () => {
//         if (!file) {
//             setMessage('Por favor, selecciona un archivo RDF.');
//             return;
//         }

//         setIsUploading(true);

//         const formData = new FormData();
//         formData.append("rdf_file", file);

//         console.log("Uploading file:", file);

//         fetch("http://localhost:8001/api/upload_rdf/", {
//             method: "POST",
//             body: formData,
//         })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     setMessage('Base de datos actualizada con éxito.');
//                 } else {
//                     setMessage(`Error: ${data.message}`);
//                 }
//             })
//             .catch(error => {
//                 setMessage(`Error al subir el archivo: ${error}`);
//             })
//             .finally(() => {
//                 setIsUploading(false);
//             });
//     };

//     return (
//         <div className="rdf-upload">
//             <h3>Poblar la base de datos</h3>
//             <input type="file" onChange={handleFileChange} />
//             <div style={{ marginTop: '10px' }}>
//                 <Button variant="primary" onClick={handleFileUpload}>Poblar base de datos</Button>
//             </div>
//             {message && <p>{message}</p>}

//             {isUploading && (
//                 <div className="overlay">
//                     <div className="spinner-container">
//                         <Spinner animation="border" role="status" style={{ color: '#ECB289' }}/>
//                         <p>Poblando base de datos</p>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default RDFUpload;
