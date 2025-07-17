import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import Swal from 'sweetalert2'; // Import SweetAlert2
import { InformationCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Import icons
import { API_BASE_URL } from '../../service/BaseUrl';



const STUDENT_ID_SESSION_KEY = "verifiedStudentId";
export default function FormDetailStudent({ selectedId, isEdit = false, valueID, onSubmitSuccess }) {
  const [formState, setFormState] = useState({});
  const [fieldForm, setFieldForm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [verifiedStudentId] = useState(() => sessionStorage.getItem(STUDENT_ID_SESSION_KEY) || null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("isEdit", isEdit);
    if (isEdit) {
      fetchData();
    }
   
    async function getFormDetail() {
      console.log("Id " + selectedId);
      setLoading(false);

      try {
        const url = `${API_BASE_URL}/forms/${selectedId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }


        const result = await response.json();
        setFieldForm(result);
        console.log(result);
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      }
    }
        async function fetchDependencies() {
          const res = await fetch(`${API_BASE_URL}/forms/${selectedId}/dependencies`);
          const data = await res.json();
          if (data.dependencies.length > 0) {
            console.log("dependency_form_ids", data.dependencies);
            const notification = `Bạn cần nộp thêm các biểu mẫu sau: ${data.dependencies.map(form => form.name).join(', ')}`;
            setNotification(notification);
          }
        }
        fetchDependencies();

        getFormDetail();

  }, [selectedId, id]);
  async function fetchData() {
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


    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
  }
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

    try {
      const response = await fetch(`${API_BASE_URL}/submit-form/${selectedId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentCode: verifiedStudentId,
          values: formState,
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi nộp biểu mẫu");
      }

      const data = await response.json();
        let swalTitle = 'Gửi thành công!';
        let swalText = 'Biểu mẫu của bạn đã được nộp thành công.';
        let swalIcon = 'success';

        if(notification) {
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

    async function handleUpdate(e) {
      e.preventDefault();
      console.log("valueID", formState);
      try {
          const response = await fetch(`${API_BASE_URL}/update-data-form/${selectedId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: formState,
            form_request_id: valueID,
          }),
        });

        if (!response.ok) {
          throw new Error("Lỗi khi cập nhật biểu mẫu");
        }

        const data = await response.json();
        console.log("data", data);
        if (onSubmitSuccess) {
          Swal.fire({
            icon: 'success',
            title: 'Cập nhật thành công!',
            text: 'Biểu mẫu của bạn đã được cập nhật thành công.',
            confirmButtonText: 'Đóng',
          }).then(() => {
            onSubmitSuccess();
          });
          
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật biểu mẫu:', error);
    }
  }
    return (

      <div className="min-h-screen bg-blue-50 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
          <h2 className="text-3xl font-bold pt-3 text-center">
            {fieldForm.name}
          </h2>

          <form  onSubmit={isEdit ? handleUpdate : handleSubmit} className="px-10 py-12 space-y-10">
            {fieldForm.field_form
              .sort((a, b) => a.order - b.order)
              .map((field) => (
                <div key={field.id}>
                  <label className="text-start w-full block pl-2 font-medium text-base text-gray-800 mb-1">
                    {field.label}
                  </label>

                  {field.data_type === "text" && (
                    <input
                      type="text"
                      className="w-full !max-w-full border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  )}

                  {field.data_type === "number" && (
                    <input
                      type="number"
                      placeholder="Nhập số"
                      className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  )}

                  {field.data_type === "textarea" && (
                    <textarea
                      rows={4}
                      placeholder="Nhập nội dung"
                      className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  )}

                  {field.data_type === "date" && (
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    />
                  )}

                  {field.data_type === "radio" && (
                    <div className="space-y-2 mt-2">
                      {field.options?.map((opt, idx) => (
                        <label key={idx} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`field-${field.id}`}
                            value={opt}
                            checked={formState[field.id] === opt}
                            onChange={() => handleChange(field.id, opt)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.data_type === "checkbox" && (
                    <div className="space-y-2 mt-2">
                      {field.options?.map((opt, idx) => (
                        <label key={idx} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            name={`field-${field.id}`}
                            value={opt}
                            checked={formState[field.id]?.includes(opt) || false}
                            onChange={() => handleChange(field.id, opt, true)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {field.data_type === "select" && (
                    <select
                      className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formState[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                    >
                      <option value="">-- Chọn --</option>
                      {field.options?.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-xl transition duration-300"
              >
                {isEdit ? "Cập nhật" : "Gửi biểu mẫu"}
              </button>
            </div>
          </form>
        </div>
      </div>

    );
  }