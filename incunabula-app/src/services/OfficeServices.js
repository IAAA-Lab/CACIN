import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getOffices = async () => {
    const response = await axios.get(`${API_URL}offices`);
    return response.data;
}

export const getOfficeById = async (id) => {
    const response = await axios.get(`${API_URL}offices/${id}`);
    return response.data;
}

export const  getOfficeFontTypes = async () => {
    const response = await axios.get(`${API_URL}offices-font/`);
    return response.data;
}
