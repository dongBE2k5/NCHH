import React, { useState, useEffect } from "react";
import Navbar from "../components/NavbarComponent";
import Table from "../components/layout/Table";

function FormStatus() {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    // Dữ liệu giả mô phỏng phản hồi từ API
    const fakeApiData = [
      {
        student_id: 1,
        form_request: [
          {
            form_name: "Đơn bảo lưu",
            created_at: "2025-04-25T10:00:00Z",
            status: "Đã duyệt",
          },
          {
            form_name: "Đơn chuyển điểm",
            created_at: "2025-04-20T14:30:00Z",
            status: "Đang chờ",
          },
          {
            form_name: "Đơn xin xác nhận sinh viên",
            created_at: "2025-03-18T09:45:00Z",
            status: "Từ chối",
          },
        ],
      },
      {
        student_id: 1,
        form_request: [
          {
            form_name: "Đơn đề nghị miễn học phí",
            created_at: "2025-04-10T08:15:00Z",
            status: "Đã duyệt",
          },
          {
            form_name: "Đơn xin tạm hoãn nghĩa vụ",
            created_at: "2025-02-28T11:00:00Z",
            status: "Đang xử lý",
          },
        ],
      },
    ];

    // Chuyển dữ liệu về dạng table cần
    const extractedForms = fakeApiData.flatMap((item) =>
      item.form_request.map((value) => ({
        name: value.form_name,
        date: new Date(value.created_at).toLocaleDateString("vi-VN"),
        status: value.status,
      }))
    );

    setForms(extractedForms);
  }, []);

  const actions = [
    {
      label: "Xem chi tiết",
      link: "/form/1",
      className: "text-blue-600 hover:underline",
    },
  ];

  return (
    <div className="bg-gray-100 font-sans">
      <Navbar userType="student" />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Trạng thái đơn</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <Table
            headers={["Tên Đơn", "Ngày nộp", "Trạng thái"]}
            data={forms}
            actions={actions}
          />
        </div>
      </div>
    </div>
  );
}

export default FormStatus;
