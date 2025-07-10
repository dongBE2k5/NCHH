import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

export default function FormDetailStudent() {
  const [formState, setFormState] = useState({});
  const [fieldForm, setFieldForm] = useState(null);
  const { id } = useParams();

    useEffect(() => {
    async function getFormDetail() {
        console.log("Id " + id);
        
        try {
            const url = `http://nckh.local/api/forms/${id}`;
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
            const response = await fetch(`http://nckh.local/api/submit-form/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formState),
            });
        

            if (!response.ok) throw new Error('Lưu thất bại');
            await response.json();
            
        } catch (error) {
            console.error('Lỗi khi lưu form:', error);
            alert('Có lỗi xảy ra khi lưu biểu mẫu.');
        }
    alert("\u0110\u00e3 g\u1eedi \u0111\u01a1n th\u00e0nh c\u00f4ng!");
  };

  return (
    
    <div className="min-h-screen pt-[72px] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10">
        <h2 className="text-4xl font-bold text-center text-blue-800 mb-10">
          {fieldForm.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {fieldForm.field_form
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id}>
                <label className="w-fit block text-base font-semibold text-gray-800 mb-2">
                  {field.label}
                </label>

                {field.data_type === "text" && (
                  <input
                    type="text"
                    className="w-full border border-gray-300 px-5 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={formState[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                )}

                {field.data_type === "number" && (
                  <input
                    type="number"
                    className="w-full border border-gray-300 px-5 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={formState[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                )}

                {field.data_type === "textarea" && (
                  <textarea
                    rows={4}
                    className="w-full border border-gray-300 px-5 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={formState[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                )}

                {field.data_type === "date" && (
                  <input
                    type="date"
                    className="w-full border border-gray-300 px-5 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={formState[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                )}

                {field.data_type === "radio" && (
                  <div className="flex space-x-6">
                    {field.options?.map((opt, idx) => (
                      <label key={idx} className="inline-flex items-center space-x-2">
                        <input
                            className="w-fit"
                          type="radio"
                          name={`field-${field.id}`}
                          value={opt}
                          checked={formState[field.id] === opt}
                          onChange={() => handleChange(field.id, opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.data_type === "checkbox" && (
                  <div className="flex flex-col space-y-2">
                    {field.options?.map((opt, idx) => (
                      <label key={idx} className="inline-flex items-center space-x-2">
                        <input
                        className="w-fit"
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
                  <select
                    className="w-full border border-gray-300 px-5 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={formState[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  >
                    <option value="">Chọn</option>
                    {field.options?.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-4 rounded-xl shadow-lg transition duration-300"
          >
Gửi          </button>
        </form>
      </div>
    </div>
  );
}
