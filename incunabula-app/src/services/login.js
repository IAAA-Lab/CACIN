
import axios from 'axios';


const API_URL = process.env.REACT_APP_API_URL;


export const login = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_URL}login/`, { email, password });
    const { access } = response.data; 
    return access;
  } catch (error) {
    console.error('Error during login:', error);
    throw error; 
  }
}

export default login;
