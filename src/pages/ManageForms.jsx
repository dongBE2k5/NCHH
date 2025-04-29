import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Table from "../components/Table";

function ManageForms() {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    // Giả lập gọi API để lấy danh sách biểu mẫu
    setForms([
      { student: "Nguyễn Văn A", name: "Đơn bảo lưu", date: "25/04/2025", status: "Đang chờ" },
    ]);
  }, []);

  const actions = [
    { label: "Duyệt", link: "/form/1/approve", className: "text-green-600 hover:underline mr-2" },
    { label: "Từ chối", link: "/form/1/reject", className: "text-red-600 hover:underline" },
  ];

  return (
    <div className="bg-gray-100 font-sans">
      <Navbar userType="staff" />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Quản lý biểu mẫu</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <Table
            headers={["Tên sinh viên", "Tên biểu mẫu", "Ngày nộp", "Trạng thái"]}
            data={forms}
            actions={actions}
          />
        </div>
      </div>
    </div>
  );
}

export default ManageForms;