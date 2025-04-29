import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

function FormList() {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    // Giả lập gọi API để lấy danh sách biểu mẫu
    const fetchForms = async () => {
      const data = [
        { title: "Đơn chuyển điểm", description: "Yêu cầu chuyển điểm từ môn học khác.", link: "/form/submit/transfer" },
        { title: "Đơn thôi học", description: "Yêu cầu thôi học tại trường.", link: "/form/submit/dropout" },
        { title: "Đơn bảo lưu", description: "Yêu cầu bảo lưu kết quả học tập.", link: "/form/submit/reserve" },
      ];
      setForms(data);
    };
    fetchForms();
  }, []);

  return (
    <div className="bg-gray-100 font-sans">
      <Navbar userType="student" />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Danh sách biểu mẫu</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map((form, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold">{form.title}</h3>
              <p>{form.description}</p>
              <a href={form.link} className="text-blue-600 hover:underline">Bắt đầu</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FormList;