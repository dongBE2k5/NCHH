import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

function StaffDashboard() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    // Giả lập gọi API để lấy thống kê
    setStats({ pending: 15, approved: 50, rejected: 5 });
  }, []);

  return (
    <div className="bg-gray-100 font-sans">
      <Navbar userType="staff" />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Bảng điều khiển nhân viên</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Biểu mẫu đang chờ</h3>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Biểu mẫu đã duyệt</h3>
            <p className="text-2xl font-bold">{stats.approved}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold">Biểu mẫu bị từ chối</h3>
            <p className="text-2xl font-bold">{stats.rejected}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            title="Tìm kiếm sinh viên"
            description="Tra cứu thông tin sinh viên."
            link="/search"
          />
          <Card
            title="Quản lý biểu mẫu"
            description="Xem và xử lý biểu mẫu."
            link="/manage-forms"
          />
          <Card
            title="Gửi thông báo"
            description="Gửi thông báo đến sinh viên."
            link="/notifications"
          />
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;