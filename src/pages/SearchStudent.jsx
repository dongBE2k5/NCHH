import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Table from "../components/Table";

function SearchStudent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Giả lập gọi API để tìm kiếm sinh viên
    if (searchTerm) {
      setStudents([{ id: "SV001", name: "Nguyễn Văn A" }]);
    }
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Xử lý tìm kiếm
    console.log("Tìm kiếm:", searchTerm);
  };

  const actions = [
    { label: "Xem hồ sơ", link: "/student/SV001", className: "text-blue-600 hover:underline" },
  ];

  return (
    <div className="bg-gray-100 font-sans">
      <Navbar userType="staff" />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Tìm kiếm sinh viên</h1>
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Nhập tên hoặc mã sinh viên"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded mt-2 hover:bg-blue-700"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <Table
            headers={["Mã sinh viên", "Họ tên"]}
            data={students}
            actions={actions}
          />
        </div>
      </div>
    </div>
  );
}

export default SearchStudent;