// src/services/RequestStudentService.js
import axios from 'axios';
import { API_BASE_URL } from './BaseUrl';

const API_URL = `${API_BASE_URL}/request-students`;

const RequestStudentService = {
  /**
   * Lấy tất cả các yêu cầu biểu mẫu của sinh viên.
   * @returns {Promise<Array>} Danh sách các yêu cầu biểu mẫu.
   */
  fetchAll: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  /**
   * Tạo một yêu cầu biểu mẫu mới cho sinh viên.
   * @param {string} studentCode - Mã số sinh viên.
   * @param {number} folderId - ID của biểu mẫu/thư mục.
   * @param {string} status - Trạng thái của yêu cầu (ví dụ: "Đang chờ duyệt").
   * @returns {Promise<Object>} Dữ liệu của yêu cầu biểu mẫu vừa được tạo.
   */
  create: async (studentCode, folderId, status) => {
    const response = await axios.post(API_URL, {
      student_code: studentCode,
      folder_id: folderId,
      status: status,
    });
    return response.data;
  },

  /**
   * Cập nhật trạng thái hoặc các trường khác của một yêu cầu biểu mẫu.
   * @param {number} id - ID của yêu cầu biểu mẫu cần cập nhật.
   * @param {Object} dataToUpdate - Đối tượng chứa các trường và giá trị mới cần cập nhật (ví dụ: { status: "Đã duyệt" }).
   * @returns {Promise<Object>} Dữ liệu của yêu cầu biểu mẫu đã được cập nhật.
   */
  update: async (id, dataToUpdate) => {
    const response = await axios.put(`${API_URL}/${id}`, dataToUpdate);
    return response.data;
  },

  /**
   * Cập nhật trạng thái hàng loạt cho nhiều yêu cầu biểu mẫu.
   * @param {Array<number>} ids - Mảng các ID của yêu cầu biểu mẫu cần cập nhật.
   * @param {string} status - Trạng thái mới.
   * @returns {Promise<Object>} Phản hồi từ API.
   * LƯU Ý: Đây là phương thức tùy chỉnh cho trường hợp API backend của bạn hỗ trợ bulk update.
   * Nếu không, bạn sẽ cần gọi RequestStudentService.update() nhiều lần.
   */
  bulkUpdateStatus: async (ids, status) => {
    const response = await axios.post(`${API_URL}/bulk-update-status`, {
      ids: ids,
      status: status,
    });
    return response.data;
  },

  /**
   * Xóa một yêu cầu biểu mẫu của sinh viên.
   * @param {number} id - ID của yêu cầu biểu mẫu cần xóa.
   * @returns {Promise<Object>} Phản hồi từ API sau khi xóa.
   */
  remove: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  /**
   * Lấy một yêu cầu biểu mẫu cụ thể theo ID.
   * @param {number} id - ID của yêu cầu biểu mẫu.
   * @returns {Promise<Object>} Dữ liệu của yêu cầu biểu mẫu.
   */
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },
};

export default RequestStudentService;