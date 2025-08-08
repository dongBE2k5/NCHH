// src/services/FormService.js
import axios from 'axios';
import { API_BASE_URL } from './BaseUrl';

const FORMS_API_URL = `${API_BASE_URL}/forms`;
const UPLOAD_API_URL = `${API_BASE_URL}/upload-docx1`;
const ADMIN_LAYOUT_API_URL = `${API_BASE_URL}/admin/create-layout-form`;
const DEPENDENCY_API_URL = `${API_BASE_URL}/forms/dependency`;

const FormService = {
    /**
     * Fetches all forms.
     * Corresponds to GET /forms
     */
    fetchAllForms: async () => {
        const response = await axios.get(FORMS_API_URL);
        return response.data;
    },

    /**
     * Fetches details for a specific form.
     * Corresponds to GET /forms/:id
     */
    fetchFormDetails: async (id) => {
        const response = await axios.get(`${FORMS_API_URL}/${id}`);
        return response.data;
    },

    /**
     * Fetches dependencies for a specific form.
     * Corresponds to GET /forms/:id/dependencies
     */
    fetchFormDependencies: async (id) => {
        const response = await axios.get(`${FORMS_API_URL}/${id}/dependencies`);
        return response.data;
    },

    /**
     * Uploads a docx file for layout creation.
     * Corresponds to POST /upload-docx1
     */
    uploadDocxForLayout: async (file) => {
        const formData = new FormData();
        formData.append('doc_file', file);
        const response = await axios.post(UPLOAD_API_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Creates or updates the layout form.
     * Corresponds to POST /admin/create-layout-form/:id
     */
    createLayoutForm: async (id, filename) => {
        const response = await axios.post(`${ADMIN_LAYOUT_API_URL}/${id}`, {
            "form_model": filename
        });
        return response.data;
    },

    /**
     * Saves form fields and PDF URL.
     * Corresponds to POST /forms/:id
     */
    saveFormFieldsAndPdf: async (id, fields, urlDownload, secondFile) => {
        const formData = new FormData();
        formData.append('type_of_form_id', id);
        formData.append('fields', JSON.stringify(fields));
        formData.append('url_pdf', urlDownload);
        if (secondFile) {
            formData.append('doc_file', secondFile);
        }
        const response = await axios.post(`${FORMS_API_URL}/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Saves form dependencies.
     * Corresponds to POST /forms/dependency
     */
    saveFormDependency: async (formId, dependencyFormIds) => {
        const response = await axios.post(DEPENDENCY_API_URL, {
            'form_id': formId,
            'dependency_form_id': dependencyFormIds,
        });
        return response.data;
    },
};

export default FormService;
