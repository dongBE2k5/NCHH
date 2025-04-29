import React from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

function StudentDashboard() {
  const notifications = [
    "Đơn bảo lưu của bạn đã được duyệt (10:00, 25/04/2025).",
    "Hạn nộp đơn chuyển điểm: 30/04/2025.",
  ];

  return (
    <div className="bg-gray-100 font-sans">
      <Navbar userType="student" />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Xin chào, Nguyễn Văn A</h1>
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Thông báo</h2>
          <ul className="list-disc pl-5">
            {notifications.map((notification, index) => (
              <li key={index}>{notification}</li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            title="Nộp biểu mẫu mới"
            description="Điền và nộp các biểu mẫu học vụ trực tuyến."
            link="/forms"
          />
          <Card
            title="Xem trạng thái biểu mẫu"
            description="Theo dõi tiến độ xử lý các biểu mẫu đã nộp."
            link="/status"
          />
          <Card
            title="Xem hồ sơ cá nhân"
            description="Cập nhật thông tin cá nhân và lịch sử học vụ."
            link="/profile"
          />
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;