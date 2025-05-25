import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';

const formData = {
  id: 1,
  name: "\u0110\u01a1n xin ngh\u1ec9 h\u1ecdc",
  "form-model": "123",
  field_form: [
    { id: 9, data_type: "radio", label: "Gi\u1edbi t\u00ednh", options: ["Nam", "N\u1eef"], order: 1 },
    { id: 10, data_type: "text", label: "H\u1ecd v\u00e0 t\u00ean", options: null, order: 2 },
    { id: 11, data_type: "checkbox", label: "L\u00fd do ngh\u1ec9", options: ["B\u1ec7nh", "Vi\u1ec7c gia \u0111\u00ecnh", "Kh\u00e1c"], order: 3 },
    { id: 12, data_type: "select", label: "L\u1edbp h\u1ecdc", options: ["10A1", "10A2", "10A3"], order: 4 },
    { id: 13, data_type: "textarea", label: "Ghi ch\u00fa th\u00eam", options: null, order: 5 },
    { id: 14, data_type: "date", label: "Ng\u00e0y xin ngh\u1ec9", options: null, order: 6 },
  ],
};

export default function FormDetailStudent() {
  const [formState, setFormState] = useState({});
  const [fieldForm, setFieldForm] = useState(null);
  const { id } = useParams();

    useEffect(() => {
    async function getAllForm() {
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
    

    getAllForm();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", formState);
    alert("\u0110\u00e3 g\u1eedi \u0111\u01a1n th\u00e0nh c\u00f4ng!");
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
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
