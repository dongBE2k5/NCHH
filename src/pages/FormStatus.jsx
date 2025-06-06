import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Table from "../components/Table";

function FormStatus() {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    // Giả lập gọi API để lấy trạng thái biểu mẫu
    setForms([
      { name: "Đơn bảo lưu", date: "25/04/2025", status: "Đã duyệt" },
      { name: "Đơn chuyển điểm", date: "20/04/2025", status: "Đang chờ" },
    ]);
  }, []);

  const actions = [
    { label: "Xem chi tiết", link: "/form/1", className: "text-blue-600 hover:underline" },
  ];

  return (
    <div className="bg-gray-100 font-sans">
      <Navbar userType="student" />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Trạng thái biểu mẫu</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <Table
            headers={["Tên biểu mẫu", "Ngày nộp", "Trạng thái"]}
            data={forms}
            actions={actions}
          />
        </div>
      </div>
    </div>
  );
}

export default FormStatus;