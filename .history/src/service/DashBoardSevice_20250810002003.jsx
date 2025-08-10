import axios from 'axios';
import{API_BASE_URL} from './BaseUrl'
const API_URL = `${API_BASE_URL}/dashboard`;

const DashboardSev = {
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
}