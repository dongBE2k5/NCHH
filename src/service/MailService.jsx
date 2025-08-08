// src/services/MailService.js
import axios from 'axios';
import { API_BASE_URL } from './BaseUrl';

const API_URL = `${API_BASE_URL}/send-email-student`;

const MailService = {
  /**
   * Gửi email thông báo đến một hoặc nhiều sinh viên.
   * @param {string} title - Tiêu đề của email.
   * @param {string} message - Nội dung của email.
   * @param {Array<string>} student_codes - Mảng các mã số sinh viên sẽ nhận email.
   * @returns {Promise<Object>} Phản hồi từ API gửi email.
   */
  sendStudentEmail: async (title, message, student_codes) => {
    const response = await axios.post(API_URL, {
      title,
      message,
      student_codes,
    });
    return response.data;
  },
};

export default MailService;