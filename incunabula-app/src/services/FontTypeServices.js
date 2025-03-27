import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const getFontTypes = async () => {
    const response = await axios.get(`${API_URL}fontType`);
    return response.data;
}

export const getFontTypesById = async (id) => {
    const response = await axios.get(`${API_URL}fontType/${id}`);
    return response.data;
}
