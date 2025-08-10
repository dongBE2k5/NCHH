import axios from 'axios';
import{API_BASE_URL} from './BaseUrl'
const API_URL = `${API_BASE_URL}/dashboard`;

const DashBoardSevice = {
  fetchAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },
  fetchWaiting: async () => {
    const response = await axios.get(`${API_URL}/waiting`);
    return response.data;
  
  },
  fetchSuccess: async () => {
    const response = await axios.get(`${API_URL}/`);
    return response.data;
  
  },
  fetchWaiting: async () => {
    const response = await axios.get(`${API_URL}/waiting`);
    return response.data;
  
  },
}