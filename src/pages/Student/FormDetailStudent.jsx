import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import Swal from 'sweetalert2';
import { InformationCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../../service/BaseUrl';

const STUDENT_ID_SESSION_KEY = "verifiedStudentId";

export default function FormDetailStudent({ selectedId, isEdit = false, valueID }) {
  const [formState, setFormState] = useState({});
  const [fieldForm, setFieldForm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [verifiedStudentId] = useState(() => sessionStorage.getItem(STUDENT_ID_SESSION_KEY) || null);
  const [loading, setLoading] = useState(true);
  const [dependencies, setDependencies] = useState([]);
  const [currentDependencyIndex, setCurrentDependencyIndex] = useState(0);
  const [currentFormId, setCurrentFormId] = useState(null);
  const [isPreview, setIsPreview] = useState(false); // State mới để quản lý chế độ xem trước

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      fetchDataSubmit();
    }
    async function fetchDataSubmit() {
      try {
        const [detailRes, valueRes] = await Promise.all([
          fetch(`${API_BASE_URL}/forms/${selectedId}`),
          fetch(`${API_BASE_URL}/preview-form/${valueID}`)
        ]);

        if (!detailRes.ok || !valueRes.ok) throw new Error("Lỗi khi fetch dữ liệu");

        const detailData = await detailRes.json();
        const valueData = await valueRes.json();
        const converted = {};
        valueData.values.forEach(item => {
          converted[item.field_form_id] = item.value;
        });
        setFormState(converted);
        console.log("detailData", detailData);
        console.log("valueData", valueData.values);
        console.log("converted", converted);

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    }

    const formToFetchId = currentDependencyIndex === 0
      ? (selectedId || id)
      : dependencies[currentDependencyIndex - 1]?.id;

    if (!formToFetchId) {
      console.error("Không xác định được formToFetchId.");
      setNotification("Không tìm thấy ID biểu mẫu để hiển thị.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Luôn lấy form để hiển thị
        const formResponse = await axios.get(`${API_BASE_URL}/forms/${formToFetchId}`);
        setFieldForm(formResponse.data);
        setCurrentFormId(formResponse.data?.id);

        // 2. CHỈ gọi dependencies khi là form gốc (ban đầu)
        if (currentDependencyIndex === 0) {
          const dependenciesResponse = await axios.get(`${API_BASE_URL}/forms/${formToFetchId}/dependencies`);
          const dependenciesData = dependenciesResponse.data;

          if (dependenciesData.dependencies?.length > 0) {
            setDependencies(dependenciesData.dependencies);
            const requiredForms = dependenciesData.dependencies.map(f => f.name).join(", ");
            setNotification(`Bạn cần nộp thêm các biểu mẫu sau: ${requiredForms}`);
          } else {
            setDependencies([]);
            setNotification(null);
          }
        }

      } catch (error) {
        console.error("Lỗi khi tải form hoặc dependencies:", error);
        setNotification("Đã xảy ra lỗi khi tải biểu mẫu hoặc thông tin phụ thuộc.");
        setFieldForm(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedId, id, currentDependencyIndex, isEdit, valueID]); // Thêm isEdit và valueID vào dependencies

  useEffect(() => {
    if (fieldForm && fieldForm.field_form && !isEdit) {
      const initialState = {};
      fieldForm.field_form.forEach(field => {
        initialState[field.id] = field.data_type === "checkbox" ? [] : "";
      });
      setFormState(initialState);
    }
  }, [fieldForm, isEdit]);

  const handleChange = (id, value, isCheckbox = false) => {
    // Ngăn không cho chỉnh sửa nếu đang ở chế độ xem trước
    if (isPreview) return;

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

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    // Khi người dùng nhấn nút "Gửi Biểu Mẫu" lần đầu, chuyển sang chế độ xem trước
    setIsPreview(true);
  };

  const handleConfirmSubmit = async () => {
    if (!verifiedStudentId) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi xác thực',
        text: 'Không tìm thấy Mã số sinh viên. Vui lòng quay lại trang chính để xác thực.',
        confirmButtonText: 'Đã hiểu',
        customClass: { confirmButton: 'swal-button-custom-error' },
        buttonsStyling: false,
      });
      return;
    }

    if (!currentFormId) {
      Swal.fire({
        icon: 'error',
        title: 'Thiếu ID biểu mẫu',
        text: 'Không xác định được biểu mẫu để gửi. Vui lòng tải lại trang hoặc thử lại.',
      });
      return;
    }

    const valuesToSubmit = { ...formState };
    console.log("Submitting form:", {
      student_code: verifiedStudentId,
      values: valuesToSubmit
    });
    console.log("currentFormId", currentFormId);

    try {
      await axios.post(`${API_BASE_URL}/submit-form/${currentFormId}`, {
        student_code: verifiedStudentId,
        values: valuesToSubmit,
      });

      Swal.fire({
        title: 'Gửi thành công!',
        html: notification || 'Biểu mẫu của bạn đã được nộp thành công.',
        icon: notification ? 'info' : 'success',
        confirmButtonText: 'Hoàn tất',
        customClass: { confirmButton: 'swal-button-custom-confirm py-2 px-3 hover:text-white hover:bg-blue-500 rounded-lg' },
        buttonsStyling: false,
      }).then(() => {
        setIsPreview(false); // Reset chế độ xem trước sau khi gửi thành công
        setNotification(null);
        if (dependencies.length > 0 && currentDependencyIndex < dependencies.length) {
          setCurrentDependencyIndex(prev => prev + 1);
        } else {
          navigate('/');
        }
      });

    } catch (error) {
      console.error('Lỗi khi nộp biểu mẫu:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Đã xảy ra lỗi khi nộp biểu mẫu. Vui lòng thử lại.';

      Swal.fire({
        icon: 'error',
        title: 'Thất bại!',
        text: errorMessage,
        confirmButtonText: 'Đóng',
        customClass: { confirmButton: 'swal-button-custom-error' },
        buttonsStyling: false,
      });
    }
  };

  const handleEditForm = () => {
    setIsPreview(false); // Quay lại chế độ chỉnh sửa
  };

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

  return (
    <div className="min-h-screen pt-[72px] bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h2 className="text-4xl font-bold text-center text-indigo-700 mb-10">
          {fieldForm.name}
          {dependencies.length > 0 && (
            <span className="text-lg block mt-2 text-indigo-500">
              Biểu mẫu {currentDependencyIndex + 1} / {dependencies.length + 1}
            </span>
          )}
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

        {isPreview && (
          <div className="mb-8 p-5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 flex items-start space-x-4 shadow-sm">
            <InformationCircleIcon className="h-7 w-7 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg mb-1">Kiểm tra thông tin</p>
              <p className="text-base leading-relaxed">Vui lòng kiểm tra lại các thông tin bạn đã điền. Nếu mọi thứ đã chính xác, hãy nhấn "Xác nhận gửi". Nếu cần chỉnh sửa, nhấn "Quay lại chỉnh sửa".</p>
            </div>
          </div>
        )}

        <form onSubmit={handleInitialSubmit} className="space-y-8">
          {fieldForm.field_form
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm
                                  hover:shadow-md hover:border-indigo-300 transition-all duration-300 ease-in-out">
                <div className="space-y-2">
                  <label htmlFor={`field-${field.id}`} className="block text-base text-start w-full font-medium text-gray-800 mb-1">
                    {field.label}
                    {field.is_required && <span className="text-red-500 ml-2 text-sm font-normal">(Bắt buộc)</span>}
                  </label>

                  {field.data_type === "text" && (
                    <input
                      id={`field-${field.id}`}
                      type="text"
                      className="w-full !max-w-full border border-gray-300 px-4 py-2.5 rounded-lg
                                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                                            transition-all duration-300 text-gray-800 placeholder-gray-400 text-base
                                            read-only:bg-gray-50 read-only:border-gray-200 read-only:text-gray-600 read-only:cursor-not-allowed"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.is_required}
                      placeholder={`Nhập ${field.label.toLowerCase()}`}
                      readOnly={isPreview} // Thêm thuộc tính readOnly
                    />
                  )}
                  {field.data_type === "email" && (
                    <input
                      id={`field-${field.id}`}
                      type="mail"
                      className="w-full !max-w-full border border-gray-300 px-4 py-2.5 rounded-lg
                                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                                            transition-all duration-300 text-gray-800 placeholder-gray-400 text-base
                                            read-only:bg-gray-50 read-only:border-gray-200 read-only:text-gray-600 read-only:cursor-not-allowed"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.is_required}
                      placeholder={`Nhập ${field.label.toLowerCase()}`}
                      readOnly={isPreview} // Thêm thuộc tính readOnly
                    />
                  )}
                  
                  {field.data_type === "number" && (
                    <input
                      id={`field-${field.id}`}
                      type="number"
                      className="w-full !max-w-full border border-gray-300 px-4 py-2.5 rounded-lg
                                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                                            transition-all duration-300 text-gray-800 placeholder-gray-400 text-base
                                            read-only:bg-gray-50 read-only:border-gray-200 read-only:text-gray-600 read-only:cursor-not-allowed"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.is_required}
                      placeholder={`Nhập ${field.label.toLowerCase()}`}
                      readOnly={isPreview} // Thêm thuộc tính readOnly
                    />
                  )}

                  {field.data_type === "textarea" && (
                    <textarea
                      id={`field-${field.id}`}
                      rows={5}
                      className="w-full !max-w-full border border-gray-300 px-4 py-2.5 rounded-lg
                                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                                            transition-all duration-300 text-gray-800 placeholder-gray-400 text-base
                                            read-only:bg-gray-50 read-only:border-gray-200 read-only:text-gray-600 read-only:cursor-not-allowed"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.is_required}
                      placeholder={`Nhập thông tin chi tiết cho ${field.label.toLowerCase()}`}
                      readOnly={isPreview} // Thêm thuộc tính readOnly
                    />
                  )}

                  {field.data_type === "date" && (
                    <input
                      id={`field-${field.id}`}
                      type="date"
                      className="w-full !max-w-full border border-gray-300 px-4 py-2.5 rounded-lg
                                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none
                                            transition-all duration-300 text-gray-800 text-base
                                            read-only:bg-gray-50 read-only:border-gray-200 read-only:text-gray-600 read-only:cursor-not-allowed"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      required={field.is_required}
                      readOnly={isPreview} // Thêm thuộc tính readOnly
                    />
                  )}

                  {field.data_type === "radio" && (
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                      {field.options?.map((opt, idx) => (
                        <label key={idx} htmlFor={`field-${field.id}-${idx}`} className={`inline-flex items-center space-x-3 text-base ${isPreview ? 'text-gray-600 cursor-not-allowed' : 'cursor-pointer text-gray-700 hover:text-indigo-600 transition-colors duration-200'}`}>
                          <input
                            id={`field-${field.id}-${idx}`}
                            className={`form-radio h-5 w-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 transition-colors duration-200 ${isPreview ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            type="radio"
                            name={`field-${field.id}`}
                            value={opt}
                            checked={formState[field.id] == opt}
                            onChange={() => handleChange(field.id, opt)}
                            required={field.is_required}
                            disabled={isPreview} // Thêm thuộc tính disabled
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.data_type === "checkbox" && (
                    <div className="flex flex-col space-y-3">
                      {field.options?.map((opt, idx) => (
                        <label key={idx} htmlFor={`field-${field.id}-${idx}`} className={`inline-flex items-center space-x-3 text-base ${isPreview ? 'text-gray-600 cursor-not-allowed' : 'cursor-pointer text-gray-700 hover:text-indigo-600 transition-colors duration-200'}`}>
                          <input
                            id={`field-${field.id}-${idx}`}
                            className={`form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-colors duration-200 ${isPreview ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            type="checkbox"
                            name={`field-${field.id}`}
                            value={opt}
                            checked={formState[field.id]?.includes(opt) || false}
                            onChange={() => handleChange(field.id, opt, true)}
                            required={field.is_required && (!formState[field.id] || formState[field.id].length === 0)}
                            disabled={isPreview} // Thêm thuộc tính disabled
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
                                            transition-all duration-300 bg-white text-gray-800 text-base appearance-none pr-10
                                            read-only:bg-gray-50 read-only:border-gray-200 read-only:text-gray-600 read-only:cursor-not-allowed"
                        value={formState[field.id] || ""}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        required={field.is_required}
                        disabled={isPreview} // Thêm thuộc tính disabled
                      >
                        <option value="" disabled>-- Chọn một giá trị từ danh sách --</option>
                        {field.options?.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" /></svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

          {!isPreview ? (
            <button
              type="submit" // Type submit để kích hoạt handleInitialSubmit
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-3.5 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              Xem trước và Gửi Biểu Mẫu
            </button>
          ) : (
            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={handleEditForm}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 text-xl font-bold py-3.5 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Quay lại chỉnh sửa
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-3.5 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Xác nhận và Gửi
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}