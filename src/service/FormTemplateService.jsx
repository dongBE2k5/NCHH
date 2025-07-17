// src/service/FormTemplateService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/type-of-forms';

const FormTemplateService = {
    fetchForms: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    saveForm: async (name, parentId) => {
        const response = await axios.post(API_URL, {
            name,
            parent_id: parentId ?? null
        });
        return response.data;
    },
    updateForm: async (id, name) => {
        const response = await axios.put(`${API_URL}/${id}`, { name });
        return response.data;
    },
    deleteForm: async (id) => {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    }
};

export default FormTemplateService;
