// src/services/FormService.js
import axios from 'axios';
import{API_BASE_URL} from './BaseUrl'
const API_URL = `${API_BASE_URL}/form-requests`;

const FormRequestService = {
  fetchData: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },
  saveData: async (name, parentId, isFolder) => {
    const response = await axios.post(API_URL, {
      name,
      parent_id: parentId,
      is_folder: isFolder,
    });
    return response.data;
  },
  updateData: async (id, newName) => {
    const response = await axios.put(`${API_URL}/${id}`, {
      name: newName,
    });
    return response.data;
  },
  deleteData: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
  getById:async (id) => {
       const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
  createdFile:async (id) => {
     const response = await axios.get(`${API_URL}/${id}/created-file`);
    return response.data;
  },
  getFile:async (filename) => {
     const response = await axios.get(`${API_URL}/${filename}/get-file`);
    return response.data;
  }




};

export default FormRequestService;
