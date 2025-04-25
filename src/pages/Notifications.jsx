import React, { useState } from "react";
import Navbar from "../components/Navbar";

function Notifications() {
  const [notification, setNotification] = useState({ recipient: "", content: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý gửi thông báo (gọi API)
    console.log("Gửi thông báo:", notification);
  };

  return (
    <div className="bg-gray-100 font-sans">
      <Navbar userType="staff" />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Quản lý thông báo</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Gửi đến</label>
              <input
                type="text"
                value={notification.recipient}
                onChange={(e) => setNotification({ ...notification, recipient: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Nhập email hoặc mã sinh viên"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Nội dung thông báo</label>
              <textarea
                value={notification.content}
                onChange={(e) => setNotification({ ...notification, content: e.target.value })}
                className="w-full p-2 border rounded"
                rows="4"
                placeholder="Nhập nội dung thông báo"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Gửi thông báo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Notifications;