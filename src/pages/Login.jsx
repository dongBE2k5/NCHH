import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý đăng nhập (giả lập)
    if (username === "student" && password === "123") {
      navigate("/dashboard");
    } else if (username === "staff" && password === "123") {
      navigate("/staff-dashboard");
    } else {
      alert("Thông tin đăng nhập không đúng!");
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo Trường" className="h-16" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-4">Hệ thống Học vụ</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Tên người dùng</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Nhập mã sinh viên hoặc mã nhân viên"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Nhập mật khẩu"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Đăng nhập
          </button>
          <p className="text-center mt-4">
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Quên mật khẩu?
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;