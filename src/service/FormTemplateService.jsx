// src/service/FormTemplateService.js
import axios from 'axios';
import{API_BASE_URL} from './BaseUrl'
const API_URL = `${API_BASE_URL}/type-of-forms`;

const FormTemplateService = {
    fetchForms: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    saveForm: async (name, parentId,note) => {
        const response = await axios.post(API_URL, {
            name,
        
            parent_id: parentId ?? null
            ,note
        });
        return response.data;
    },
    updateForm: async (id, name,note) => {
        const response = await axios.put(`${API_URL}/${id}`, { name ,note});
        return response.data;
    },
    deleteForm: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    }, updateNote: async (id, note) => {
        const response = await axios.put(`${API_URL}/${id}`, { note });
        return response.data;
    },
};

export default FormTemplateService;
