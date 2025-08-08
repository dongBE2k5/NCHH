// src/services/GoogleDriveService.js
import axios from 'axios';
import { API_BASE_URL } from './BaseUrl';

const API_URL = `${API_BASE_URL}/google-drive`;


const GoogleDriveService = {
    /**
     * Uploads a docx file to Google Drive.
     * Corresponds to POST /google-drive/upload-docx
     * @param {File} file - The docx file to upload.
     * @returns {Promise<Object>} - The response data from the API.
     */
    uploadDocx: async (file) => {
        const formData = new FormData();
        formData.append('docx_file', file);
        const response = await axios.post(`${API_URL}/upload-docx`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Exports a PDF from Google Drive using a file ID.
     * Corresponds to GET /google-drive/export-pdf?fileId=...
     * @param {string} fileId - The ID of the Google Drive file to export as PDF.
     * @returns {Promise<Object>} - The response data containing pdf_url and file_name.
     */
    exportPdf: async (fileId) => {
        const response = await axios.get(`${API_URL}/export-pdf?fileId=${fileId}`);
        return response.data;
    },
};

export default GoogleDriveService;
