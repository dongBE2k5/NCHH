import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/NavbarComponent";

function FormSubmit() {
  const [formData, setFormData] = useState({ reason: "", duration: "1 học kỳ" });
  const navigate = useNavigate();
  const location = useLocation();
  const formType = new URLSearchParams(location.search).get("type") || "reserve";

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý nộp biểu mẫu (gọi API)
    console.log("Nộp biểu mẫu:", formData);
    navigate("/status");
  };

  return (
    <div className="bg-gray-100 font-sans">
      <Navbar userType="student" />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Đơn {formType === "reserve" ? "bảo lưu" : formType === "transfer" ? "chuyển điểm" : "thôi học"}</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700">Lý do</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-2 border rounded"
                rows="4"
                placeholder="Nhập lý do"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">Thời gian</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option>1 học kỳ</option>
                <option>2 học kỳ</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-gray-500 text-white p-2 rounded mr-2 hover:bg-gray-600"
                onClick={() => console.log("Lưu nháp:", formData)}
              >
                Lưu nháp
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Nộp đơn
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormSubmit;