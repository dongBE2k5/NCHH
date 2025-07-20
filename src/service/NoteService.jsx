// src/service/NoteService.js
import axios from 'axios';


const API_URL = 'http://localhost:8000/api/notes'; // Thay đổi URL API của bạn

class NoteService {
    fetchNotes() {
        // Giả sử API trả về một mảng các ghi chú
        return axios.get(API_URL).then(response => response.data);
    }

    saveNote(name,content ,parentId) {
        return axios.post(API_URL, {name,content, parent_id: parentId });
    }

    updateNote(id,name, content) {
        return axios.put(`${API_URL}/${id}`, {name, content });
    }

    deleteNote(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
    showFolder(id){
        return axios.get(`${API_URL}/showParent/${id}`)
    }
}

export default new NoteService();