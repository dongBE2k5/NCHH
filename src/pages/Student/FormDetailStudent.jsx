import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
const STUDENT_ID_SESSION_KEY = "verifiedStudentId";
export default function FormDetailStudent({ selectedId, isEdit = false, valueID }) {
  const [formState, setFormState] = useState({});
  const [fieldForm, setFieldForm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [verifiedStudentId, setVerifiedStudentId] = useState(() => sessionStorage.getItem(STUDENT_ID_SESSION_KEY) || null);
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {

    if (isEdit) {
      fetchData();
    }
    async function fetchData() {
      try {
        const [detailRes, valueRes] = await Promise.all([
          fetch(`http://nckh.local/api/forms/${selectedId}`),
          fetch(`http://nckh.local/api/preview-form/${valueID}`)
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
    async function getFormDetail() {
      console.log("Id " + selectedId);

      try {
        const url = `http://nckh.local/api/forms/${selectedId}`;
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
      const res = await fetch(`http://nckh.local/api/forms/${selectedId}/dependencies`);
      const data = await res.json();
      if (data.dependencies.length > 0) {
        console.log("dependency_form_ids", data.dependencies);
        const notification = `Bạn cần nộp thêm các biểu mẫu sau: ${data.dependencies.map(form => form.name).join(', ')}`;
        setNotification(notification);
      }
    }

    fetchDependencies();

    getFormDetail();
  }, []);
  if (!fieldForm) {
    return <div className="text-center py-10">Đang tải biểu mẫu...</div>;
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
    console.log("Submitted:", formState);

    try {
      const response = await fetch(`http://nckh.local/api/submit-form/${selectedId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentCode: verifiedStudentId,
          values: formState,
        }),
      });

      if (!response.ok) throw new Error('Lưu thất bại');
      await response.json();

    } catch (error) {
      console.error('Lỗi khi lưu form:', error);
      alert('Có lỗi xảy ra khi lưu biểu mẫu.');
      return;
    }

    if (notification !== null) {
      Swal.fire({
        title: 'Thành công',
        text: notification,
      });
      navigate('/');
    } else {
      Swal.fire({
        title: 'Thành công',
        text: 'Bạn đã nộp biểu mẫu thành công',
        icon: 'success',
      });
      navigate('/status');
    }
  };


  return (

    <div className="min-h-screen bg-blue-50 py-5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
        <h2 className="text-3xl font-bold pt-3 text-center">
          {fieldForm.name}
        </h2>

        <form onSubmit={handleSubmit} className="px-10 py-12 space-y-10">
          {fieldForm.field_form
            .sort((a, b) => a.order - b.order)
            .map((field, index) => (
              <div key={field.id}>
                <label className="text-start w-full block pl-2 font-medium text-base text-gray-800 mb-1">
                  {field.label}
                </label>

                {field.data_type === "text" && (
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
