import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { XMarkIcon } from '@heroicons/react/20/solid'; // Import icon đóng modal
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; // Icons cho toast

function FormDetailForPrint() {
  const { mssv, id: folderId ,date } = useParams();
  const [forms, setForms] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoadingPrint, setIsLoadingPrint] = useState(false); // State cho loading của nút in

  // === State cho Custom Toast Notification ===
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info'); // 'success', 'error', 'info', 'warning'

  // Hàm hiển thị toast notification tùy chỉnh
  const showCustomToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage('');
      setToastType('info');
    }, 4000); // Tự động ẩn sau 4 giây
  };

  useEffect(() => {
    const fetchFormsInFolder = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/form-values/${mssv}/${folderId}/${date}`);
        const data = res.data; // axios trả về data trong thuộc tính .data

        setForms(data || []);

        // Lấy tên sinh viên từ value "mssv" nếu có
        // Cần kiểm tra cấu trúc dữ liệu trả về từ API /form-value-folder
        // Giả sử API trả về một mảng các form_request, mỗi form_request có student_name và student_code
        if (data && data.length > 0) {
          setStudentName(data[0].student_name ?? mssv); // Lấy tên sinh viên từ form đầu tiên
        } else {
          setStudentName(mssv); // Nếu không có data, dùng mssv
        }

        setNotes(`Ghi chú về sinh viên ${mssv} (demo).`);
      } catch (err) {
        console.error('Lỗi khi fetch dữ liệu:', err);
        showCustomToast("Lỗi khi tải dữ liệu biểu mẫu. Vui lòng thử lại.", "error");
      }
    };

    fetchFormsInFolder();
  }, [mssv, folderId]);

  // Hàm xử lý khi nhấn nút "In Đơn"
  const handlePrintForm = async (formRequestId) => {
    setIsLoadingPrint(true); // Bắt đầu loading
    showCustomToast("Đang tạo và tải file lên Google Drive...", "info");

    try {
      const response = await axios.get(`http://localhost:8000/api/google-drive/generate-upload/${formRequestId}`);
      const result = response.data;

      if (result.success && result.url) {
        showCustomToast("Tạo và upload file thành công! Đang mở file...", "success");
        window.open(result.url, '_blank'); // Mở URL trong tab mới
      } else {
        showCustomToast(result.message || "Lỗi khi tạo và upload file lên Google Drive.", "error");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API in/upload:", error);
      showCustomToast("Đã xảy ra lỗi khi in hoặc upload file. Vui lòng thử lại.", "error");
    } finally {
      setIsLoadingPrint(false); // Kết thúc loading
    }
  };

  // Lấy class và icon cho toast dựa trên loại
  const getToastClasses = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: <CheckCircleIcon className="h-6 w-6 text-white" />
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: <ExclamationCircleIcon className="h-6 w-6 text-white" />
        };
      case 'warning':
        return {
          bg: 'bg-orange-500',
          icon: <ExclamationCircleIcon className="h-6 w-6 text-white" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500',
          icon: <InformationCircleIcon className="h-6 w-6 text-white" />
        };
    }
  };

  const { bg: toastBgClass, icon: toastIcon } = getToastClasses(toastType);


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Custom Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center p-4 rounded-lg shadow-lg text-white ${toastBgClass} transition-all duration-300 ease-out transform translate-x-0 opacity-100`}>
          <div className="flex-shrink-0">
            {toastIcon}
          </div>
          <div className="ml-3 text-sm font-medium">
            {toastMessage}
          </div>
          <button
            onClick={() => setShowToast(false)}
            className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-white rounded-lg p-1.5 hover:bg-opacity-20 inline-flex h-8 w-8"
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          Biểu mẫu trong Thư mục ({folderId}) - MSSV: {studentName}
        </h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Danh sách Biểu mẫu</h2>
          {forms.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-sky-200">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">ID</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Tên Biểu mẫu</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Ngày nộp</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forms.map((form) => {
                    const createdDate = form.created_at?.split('T')[0] || '';
                    return (
                      <tr key={form.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-center">{form.id}</td>
                        <td className="px-6 py-4 text-center">{form.form_type?.name}</td>
                        <td className="px-6 py-4 text-center">{createdDate}</td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handlePrintForm(form.id)} // Gọi hàm xử lý API
                            className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition duration-200 ease-in-out ${isLoadingPrint ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoadingPrint} // Vô hiệu hóa nút khi đang loading
                          >
                            {isLoadingPrint ? (
                              <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              "In Đơn"
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600">Không có biểu mẫu nào trong thư mục này.</p>
          )}
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg shadow-inner">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Ghi chú từ Văn phòng</h2>
          <div className="w-full p-3 border border-blue-300 rounded-lg bg-white text-lg min-h-[100px]">
            {notes}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/search"
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium"
          >
            Quay lại tìm kiếm
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FormDetailForPrint;