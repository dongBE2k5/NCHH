import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Table from "../components/Table";

function StudentProfile() {
  const [profile, setProfile] = useState({
    name: "Nguyễn Văn A",
    studentId: "SV001",
    email: "nguyenvana@tdc.edu.vn",
    phone: "0123456789",
  });
  const [academicHistory, setAcademicHistory] = useState([]);

  useEffect(() => {
    // Giả lập gọi API để lấy lịch sử học vụ
    const fetchAcademicHistory = async () => {
      const data = [
        { subject: "Lập trình C", semester: "HK1 2024", grade: "8.5" },
      ];
      setAcademicHistory(data);
    };
    fetchAcademicHistory();
  }, []);

  const handleSave = () => {
    // Gọi API để lưu thông tin
    console.log("Lưu thông tin:", profile);
  };

  return (
    <div className="bg-gray-100 font-sans">
      <Navbar userType="student" />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
            <p><strong>Họ tên:</strong> {profile.name}</p>
            <p><strong>Mã sinh viên:</strong> {profile.studentId}</p>
            <div className="mb-4">
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Số điện thoại</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Lịch sử học vụ</h2>
            <Table
              headers={["Môn học", "Học kỳ", "Điểm"]}
              data={academicHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;