// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import yourLogo from '../assets/your-logo.png'; // Uncomment and replace with your actual logo path

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    // Clean up the event listener when the component unmounts
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-20 transition-all duration-300 ${isScrolled ? 'bg-blue-800 shadow-lg' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}>
      <div className="container mx-auto flex justify-between items-center px-4 py-4">
        <div className="flex items-center space-x-4">
          {/* Replace with your actual logo */}
          <img src="/image/logotdc.jpg" alt="Logo Hệ thống Nộp Đơn Học Vụ" className="h-10" />
          {/* Or if using local asset: <img src={yourLogo} alt="Your University Logo" className="h-10" /> */}
          <h1 className="text-xl font-bold text-white">Hệ thống Nộp Đơn Học Vụ</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-white hover:text-blue-200">Trang chủ</Link>
          {/* Assuming these are internal routes */}
          <Link to="/features" className="text-white hover:text-blue-200">Tính năng</Link>
          <Link to="/support" className="text-white hover:text-blue-200">Hỗ trợ</Link>
          {/* <--- ĐÃ BỎ ĐĂNG NHẬP VÀ ĐĂNG KÝ Ở ĐÂY */}
          {/* <Link to="/login" className="text-white hover:text-blue-200">Đăng nhập</Link> */}
          {/* <Link to="/signup" className="bg-yellow-400 text-blue-800 px-4 py-2 rounded-md hover:bg-yellow-500">Đăng ký</Link> */}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu" // Improved accessibility
          aria-expanded={isOpen} // Screen reader knows if menu is open
          aria-controls="mobile-menu" // Links to the mobile nav element below
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation (Conditionally rendered and animated) */}
      <nav
        id="mobile-menu" // Add id for aria-controls
        className={`md:hidden bg-blue-700 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
      >
        <div className="flex flex-col items-center space-y-4">
          <Link to="/" className="text-white hover:text-blue-200" onClick={() => setIsOpen(false)}>Trang chủ</Link>
          <Link to="/features" className="text-white hover:text-blue-200" onClick={() => setIsOpen(false)}>Tính năng</Link>
          <Link to="/support" className="text-white hover:text-blue-200" onClick={() => setIsOpen(false)}>Hỗ trợ</Link>
          {/* <--- ĐÃ BỎ ĐĂNG NHẬP VÀ ĐĂNG KÝ Ở ĐÂY */}
          {/* <Link to="/login" className="text-white hover:text-blue-200" onClick={() => setIsOpen(false)}>Đăng nhập</Link> */}
          {/* <Link to="/signup" className="bg-yellow-400 text-blue-800 px-4 py-2 rounded-md hover:bg-yellow-500" onClick={() => setIsOpen(false)}>Đăng ký</Link> */}
        </div>
      </nav>
    </header>
  );
};

export default Header;