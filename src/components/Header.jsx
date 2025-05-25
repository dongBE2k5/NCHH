// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed  w-full z-20 transition-all duration-300 ${isScrolled ? 'bg-blue-800 shadow-lg' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}>
      <div className="container mx-auto flex justify-between items-center px-4 py-4">
        <div className="flex items-center space-x-4">
          <img src="https://via.placeholder.com/40" alt="Logo" className="h-10" />
          <h1 className="text-xl font-bold text-white">Hệ thống Nộp Đơn Học Vụ</h1>
        </div>
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-blue-200">Trang chủ</Link>
          <Link to="/features" className="text-white hover:text-blue-200">Tính năng</Link>
          <Link to="/support" className="text-white hover:text-blue-200">Hỗ trợ</Link>
          <Link to="/login" className="text-white hover:text-blue-200">Đăng nhập</Link>
          <Link to="/signup" className="bg-yellow-400 text-blue-800 px-4 py-2 rounded-md hover:bg-yellow-500">Đăng ký</Link>
        </nav>
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
