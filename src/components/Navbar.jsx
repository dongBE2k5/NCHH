import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ userType }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xử lý đăng xuất (xóa token, trạng thái, v.v.)
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo Trường" className="h-10 mr-4" />
          <span className="text-xl font-bold">Hệ thống Học vụ</span>
        </div>
        <div>
          {userType === "student" ? (
            <>
              <a href="/dashboard" className="mr-4 hover:underline">Trang chủ</a>
              <a href="/profile" className="mr-4 hover:underline">Hồ sơ</a>
              <button onClick={handleLogout} className="hover:underline">Đăng xuất</button>
            </>
          ) : (
            <>
              <a href="/staff-dashboard" className="mr-4 hover:underline">Trang chủ</a>
              <button onClick={handleLogout} className="hover:underline">Đăng xuất</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;