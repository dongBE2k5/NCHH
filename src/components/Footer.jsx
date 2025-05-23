
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Footer = () => {

  return (
    <footer className="bg-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
              <p>Email: support@hethonghocvu.edu.vn</p>
              <p>Hotline: 0123 456 789</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2">
                <li><a href="#home" className="hover:text-blue-200">Trang chủ</a></li>
                <li><a href="#features" className="hover:text-blue-200">Tính năng</a></li>
                <li><a href="#support" className="hover:text-blue-200">Hỗ trợ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Theo dõi chúng tôi</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-200">Facebook</a>
                <a href="#" className="hover:text-blue-200">Twitter</a>
                <a href="#" className="hover:text-blue-200">LinkedIn</a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Vị trí</h4>
              <div className="h-32 bg-gray-200 rounded-md">
                <iframe
                  src="https://via.placeholder.com/300x120?text=Map+Placeholder"
                  className="w-full h-full rounded-md"
                  title="Map"
                ></iframe>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <p>© 2025 Hệ thống Nộp Đơn Học Vụ. All rights reserved.</p>
          </div>
        </div>
      </footer>
  );
};

export default Footer;
