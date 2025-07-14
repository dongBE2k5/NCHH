// src/services/FormService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/folder';

const FolderService = {
  fetchForms: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },
  saveForm: async (name, parentId, isFolder) => {
    const response = await axios.post(API_URL, {
      name,
      parent_id: parentId,
      is_folder: isFolder,
    });
    return response.data;
  },
  updateForm: async (id, newName) => {
    const response = await axios.put(`${API_URL}/${id}`, {
      name: newName,
    });
    return response.data;
  },
  deleteForm: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },





};

export default FolderService;
