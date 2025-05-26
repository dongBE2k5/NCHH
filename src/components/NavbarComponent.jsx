import React, { useState, useEffect, useRef } from "react";
import { animate, createScope, createSpring } from "animejs";
import { Link } from "react-router-dom";
export default function NavbarComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Giả lập đăng nhập
  const [username] = useState("Nguyễn Văn A");
  const root = useRef(null);
  const scope = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    scope.current = createScope({ root }).add(() => {
      animate(".logo-img", {
        scale: [0, 1.2, 1],
        rotate: [0, 360],
        opacity: [0, 1],
        duration: 1200,
        ease: createSpring({ stiffness: 300, damping: 20 }),
      });

      animate(".nav-item", {
        opacity: isOpen ? [0, 1] : [0, 1],
        translateY: isOpen ? [30, 0] : [0, 30],
        scale: isOpen ? [0.8, 1] : [1, 0.8],
        duration: isOpen ? 500 : 400,
        ease: createSpring({ stiffness: 250, damping: 20 }),
        delay: (el, i) => i * 150 + 200,
      });

      const dropdowns = document.querySelectorAll(".dropdown-menu");
      dropdowns.forEach((dropdown) => {
        dropdown.style.display = isOpen ? "block" : "none";
      });

      if (isOpen) {
        animate(".dropdown-menu", {
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
    <nav
      ref={root}
      className="bg-gradient-to-r from-blue-800 via-purple-900 to-indigo-900 text-white shadow-2xl sticky top-0 z-50"
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full overflow-hidden shadow-xl border-2 border-white">
            <img
              src="/image/logotdc.jpg"
              alt="Logo"
              className="w-full h-full object-cover logo-img"
            />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow">
            TDC IT
          </span>
        </div>

        {/* Toggler */}
        {/* giữ nguyên */}

        {/* Menu */}
        <div className={`w-full lg:flex lg:items-center ${isOpen ? "block" : "hidden"}`}>
          <div className="flex flex-col lg:flex-row lg:items-center w-full">
            <ul className="flex flex-col lg:flex-row text-center lg:text-left space-y-4 lg:space-y-0 lg:space-x-6 mt-4 lg:mt-0 flex-grow">
              <li>
                <Link
                  to="/dashboard"
                  className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/status"
                  className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item"
                >
                  Tình trạng đơn
                </Link>
              </li>
              <li className="relative group">
                <Link
                  to="/create-template"
                  className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item"
                >
                  Tạo mẫu đơn
                </Link>
              </li>
            </ul>

            {/* Auth */}
            <ul className="flex flex-col lg:flex-row text-center lg:text-left space-y-4 lg:space-y-0 lg:space-x-6 mt-4 lg:mt-0">
              {isLoggedIn ? (
                <>
                  <li>
                    <span className="text-lg font-medium nav-item">
                      Xin chào, {username}
                    </span>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5" />
                      </svg>
                      Đăng xuất
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item"
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="register"
                      className="text-lg font-medium hover:text-yellow-300 transition duration-300 nav-item"
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
