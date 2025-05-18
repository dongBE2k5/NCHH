import React, { useState, useEffect, useRef } from "react";
import { animate, createScope, createSpring } from 'animejs';

export default function NavbarComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Giả lập trạng thái đăng nhập
  const root = useRef(null);
  const scope = useRef(null);

  // Tự động đóng menu khi thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Anime.js Next — animate menu items, logo, dropdown
  useEffect(() => {
    scope.current = createScope({ root }).add(() => {
      const menuItemsSelector = '.nav-item';
      const dropdownSelector = '.dropdown-menu';
      const logoSelector = '.logo-img';

      animate(logoSelector, {
        scale: [0, 1.2, 1],
        rotate: [0, 360],
        opacity: [0, 1],
        duration: 1200,
        ease: createSpring({ stiffness: 300, damping: 20 }),
      });

      animate(menuItemsSelector, {
        opacity: isOpen ? [0, 1] : [0, 1],
        translateY: isOpen ? [30, 0] : [0, 30],
        scale: isOpen ? [0.8, 1] : [1, 0.8],
        duration: isOpen ? 500 : 400,
        ease: createSpring({ stiffness: 250, damping: 20 }),
        delay: (el, i) => i * 150 + 200,
      });

      const dropdowns = document.querySelectorAll(dropdownSelector);
      dropdowns.forEach(dropdown => {
        dropdown.style.display = isOpen ? 'block' : 'none';
      });

      if (isOpen) {
        animate(dropdownSelector, {
          opacity: [0, 1],
          translateY: [20, 0],
          scaleY: [0, 1],
          duration: 600,
          ease: createSpring({ stiffness: 200, damping: 15 }),
          delay: 400,
        });
      }
    });

    return () => scope.current.revert();
  }, [isOpen]);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <nav ref={root} className="bg-gradient-to-r from-blue-800 via-purple-900 to-indigo-900 text-white shadow-2xl sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img
            src="/public/image/logo-tdc-orginal.webp"
            alt="Logo"
            className="w-12 h-12 rounded-full shadow-lg logo-img"
          />
          <span className="text-2xl font-extrabold tracking-tight">TDC IT</span>
        </div>

        {/* Toggler Button for mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white focus:outline-none"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>

        {/* Menu */}
        <div className={`w-full lg:flex lg:items-center ${isOpen ? "block" : "hidden"}`}>
          <div className="flex flex-col lg:flex-row lg:items-center w-full">
            {/* Main Menu */}
            <ul className="flex flex-col lg:flex-row text-center lg:text-left space-y-4 lg:space-y-0 lg:space-x-6 mt-4 lg:mt-0 flex-grow">
              <li><a href="#" className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item">Trang chủ</a></li>
              <li><a href="#" className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item">Dịch vụ</a></li>
              <li className="relative group">
                <a href="#" className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item">Sản phẩm</a>
                <div className="absolute left-0 hidden mt-2 space-y-2 bg-white text-gray-800 rounded-lg shadow-2xl group-hover:block dropdown-menu">
                  <a href="#" className="block px-4 py-2 text-md font-medium hover:bg-blue-800 hover:text-yellow-300 transition duration-200">Sản phẩm A</a>
                  <a href="#" className="block px-4 py-2 text-md font-medium hover:bg-blue-800 hover:text-yellow-300 transition duration-200">Sản phẩm B</a>
                  <a href="#" className="block px-4 py-2 text-md font-medium hover:bg-blue-800 hover:text-yellow-300 transition duration-200">Sản phẩm C</a>
                </div>
              </li>
            </ul>

            {/* Login/Register or User Info */}
            <ul className="flex flex-col lg:flex-row text-center lg:text-left space-y-4 lg:space-y-0 lg:space-x-6 mt-4 lg:mt-0">
              {isLoggedIn ? (
                <>
                  <li><span className="text-lg font-medium nav-item">Xin chào, {{  }}</span></li>
                  <li><button onClick={handleLogout} className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item">Logout</button></li>
                </>
              ) : (
                <>
                  <li><a href="/login" className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item">Login</a></li>
                  <li><a href="/register" className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item">Register</a></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
