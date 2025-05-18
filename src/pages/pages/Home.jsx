import React from 'react';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-extrabold text-academic-blue mb-4">Chào Mừng Đến Hệ Thống Quản Lý Học Vụ</h1>
      <p className="text-base text-gray-700 mb-6 max-w-xl mx-auto">
        Quản lý thông tin sinh viên, xử lý đơn xin, và tạo báo cáo một cách hiệu quả.
      </p>
      <div className="space-x-3">
        <a href="/students" className="bg-academic-blue text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">Quản Lý Sinh Viên</a>
        <a href="/forms" className="bg-academic-blue text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition">Quản Lý Đơn</a>
      </div>
    </div>
  );
};

export default Home;