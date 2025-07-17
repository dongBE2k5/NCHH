import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import Swal from 'sweetalert2'; // Import SweetAlert2
import { InformationCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Import icons

const API_BASE_URL = "http://localhost:8000/api";
const STUDENT_ID_SESSION_KEY = "verifiedStudentId";

export default function FormDetailStudent({ selectedId }) {
  const [formState, setFormState] = useState({});
  const [fieldForm, setFieldForm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [verifiedStudentId] = useState(() => sessionStorage.getItem(STUDENT_ID_SESSION_KEY) || null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const formToFetchId = selectedId || id;

    if (!formToFetchId) {
      console.error("No form ID provided to FormDetailStudent.");
      setNotification("Không tìm thấy ID biểu mẫu để hiển thị.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [formResponse, dependenciesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/forms/${formToFetchId}`),
          axios.get(`${API_BASE_URL}/forms/${formToFetchId}/dependencies`)
        ]);

        setFieldForm(formResponse.data);

        const dependenciesData = dependenciesResponse.data;
        if (dependenciesData.dependencies && dependenciesData.dependencies.length > 0) {
          const requiredForms = dependenciesData.dependencies
            .map((form) => form.name)
            .join(", ");
          setNotification(`Bạn cần nộp thêm các biểu mẫu sau: ${requiredForms}`);
        } else {
          setNotification(null);
        }
      } catch (error) {
        console.error("Failed to fetch form details or dependencies:", error);
        setNotification("Đã xảy ra lỗi khi tải biểu mẫu hoặc thông tin phụ thuộc.");
        setFieldForm(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedId, id]);

  // --- Trạng thái Loading và Error ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-white rounded-2xl shadow-lg p-8">
        <ArrowPathIcon className="animate-spin h-10 w-10 text-indigo-500 mb-4" />
        <p className="text-lg font-medium text-gray-700">Đang tải biểu mẫu, vui lòng đợi...</p>
        {notification && <p className="text-red-500 mt-2 text-sm">{notification}</p>}
      </div>
    );
  }

  if (!fieldForm) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center bg-white rounded-2xl shadow-lg p-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-gray-800">Không thể hiển thị biểu mẫu này.</p>
        <p className="text-base mt-2 text-gray-600">{notification || "Đã có lỗi xảy ra hoặc biểu mẫu không tồn tại. Vui lòng thử lại sau."}</p>
      </div>
    );
  }

  const handleChange = (id, value, isCheckbox = false) => {
    setFormState((prev) => {
      if (isCheckbox) {
        const current = prev[id] || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [id]: updated };
      } else {
        return { ...prev, [id]: value };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verifiedStudentId) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi xác thực',
        text: 'Không tìm thấy Mã số sinh viên. Vui lòng quay lại trang chính để xác thực.',
        confirmButtonText: 'Đã hiểu',
        customClass: {
          confirmButton: 'swal-button-custom-error',
        },
        buttonsStyling: false,
      });
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/submit-form/${selectedId}`,
        {
          student_code: verifiedStudentId,
          values: formState,
        }
      );

      let swalTitle = 'Gửi thành công!';
      let swalText = 'Biểu mẫu của bạn đã được nộp thành công.';
      let swalIcon = 'success';

      if (notification) {
        swalText = notification;
        swalIcon = 'info';
      }

      Swal.fire({
        title: swalTitle,
        html: swalText,
        icon: swalIcon,
        confirmButtonText: 'Hoàn tất',
        customClass: {
          confirmButton: 'swal-button-custom-confirm',
        },
        buttonsStyling: false,
      }).then(() => {
        navigate('/');
      });

    } catch (error) {
      console.error('Lỗi khi nộp biểu mẫu:', error);
      let errorMessage = 'Đã xảy ra lỗi khi nộp biểu mẫu. Vui lòng thử lại.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = `Lỗi mạng hoặc server: ${error.message}`;
      }

      Swal.fire({
        icon: 'error',
        title: 'Thất bại!',
        text: errorMessage,
        confirmButtonText: 'Đóng',
        customClass: {
          confirmButton: 'swal-button-custom-error',
        },
        buttonsStyling: false,
      });
    }
  };

  return (
    <div className="min-h-screen pt-[72px] bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h2 className="text-4xl font-bold text-center text-indigo-700 mb-10">
          {fieldForm.name}
        </h2>

        {notification && (
          <div className="mb-8 p-5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-start space-x-4 shadow-sm">
            <InformationCircleIcon className="h-7 w-7 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg mb-1">Lưu ý quan trọng</p>
              <p className="text-base leading-relaxed">{notification}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {fieldForm.field_form
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id}
                   className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm
                              hover:shadow-md hover:border-indigo-300 transition-all duration-300 ease-in-out">
                {/* Đã chuyển về bố cục xếp chồng (label trên, input dưới) */}
                <div className="space-y-2"> {/* Thêm space-y-2 để tạo khoảng cách giữa label và input */}
                  {/* Label */}
                  <label htmlFor={`field-${field.id}`} className="block text-base font-medium text-gray-800 mb-1">
                    {field.label}
                    {field.is_required && <span className="text-red-500 ml-2 text-sm font-normal">(Bắt buộc)</span>}
                  </label>

                  {/* Input Element (now directly below label) */}
                  {field.data_type === "text" && (
                    <input
                      id={`field-${field.id}`}
                      type="text"
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg
                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                                 transition-all duration-300 text-gray-800 placeholder-gray-400 text-base"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.is_required}
                      placeholder={`Nhập ${field.label.toLowerCase()}`}
                    />
                  )}

                  {field.data_type === "number" && (
                    <input
                      id={`field-${field.id}`}
                      type="number"
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg
                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                                 transition-all duration-300 text-gray-800 placeholder-gray-400 text-base"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.is_required}
                      placeholder={`Nhập ${field.label.toLowerCase()}`}
                    />
                  )}

                  {field.data_type === "textarea" && (
                    <textarea
                      id={`field-${field.id}`}
                      rows={5}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg
                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                                 transition-all duration-300 text-gray-800 placeholder-gray-400 text-base"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.is_required}
                      placeholder={`Nhập thông tin chi tiết cho ${field.label.toLowerCase()}`}
                    />
                  )}

                  {field.data_type === "date" && (
                    <input
                      id={`field-${field.id}`}
                      type="date"
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg
                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                                 transition-all duration-300 text-gray-800 text-base"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.is_required}
                    />
                  )}

                  {field.data_type === "radio" && (
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                      {field.options?.map((opt, idx) => (
                        <label key={idx} htmlFor={`field-${field.id}-${idx}`} className="inline-flex items-center space-x-3 cursor-pointer text-gray-700 text-base hover:text-indigo-600 transition-colors duration-200">
                          <input
                            id={`field-${field.id}-${idx}`}
                            className="form-radio h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
                            type="radio"
                            name={`field-${field.id}`}
                            value={opt}
                            checked={formState[field.id] === opt}
                            onChange={() => handleChange(field.id, opt)}
                            required={field.is_required}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.data_type === "checkbox" && (
                    <div className="flex flex-col space-y-3">
                      {field.options?.map((opt, idx) => (
                        <label key={idx} htmlFor={`field-${field.id}-${idx}`} className="inline-flex items-center space-x-3 cursor-pointer text-gray-700 text-base hover:text-indigo-600 transition-colors duration-200">
                          <input
                            id={`field-${field.id}-${idx}`}
                            className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer transition-colors duration-200"
                            type="checkbox"
                            name={`field-${field.id}`}
                            value={opt}
                            checked={formState[field.id]?.includes(opt) || false}
                            onChange={() => handleChange(field.id, opt, true)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.data_type === "select" && (
                    <div className="relative">
                      <select
                        id={`field-${field.id}`}
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg
                                   focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                                   transition-all duration-300 bg-white text-gray-800 text-base appearance-none pr-10"
                        value={formState[field.id] || ""}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        required={field.is_required}
                      >
                        <option value="" disabled>-- Chọn một giá trị từ danh sách --</option>
                        {field.options?.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      {/* Custom dropdown arrow icon */}
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-3.5 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            Gửi Biểu Mẫu
          </button>
        </form>
      </div>
    </div>
  );
}