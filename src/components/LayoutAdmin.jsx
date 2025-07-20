import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Outlet } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
const LayoutAdmin = () => {
    const [loading, setLoading] = useState(true); // loading ban đầu là true
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation(); // Get current location for active link styling
    const navigate = useNavigate();
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
        } else {
            setTimeout(() => {
                setLoading(false);
            }, 2000);
        }
    }, []);
    // Effect to close sidebar on route change for mobile
    useEffect(() => {
        setIsOpen(false);
    }, [location]);
    // ✅ Giữ phần return ở cuối sau các hook
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-white">
                Đang tải...
            </div>
        );
    }
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("token_type");
        localStorage.removeItem("roles");
        navigate('/login');
    }


    return (
        <>
            {/* Sidebar Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-30 sm:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                id="sidebar-multi-level-sidebar"
                className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } sm:translate-x-0`}
                aria-label="Sidebar"
            >
                <div className="h-full px-3 py-4 overflow-y-auto bg-gradient-to-r from-blue-800 via-purple-900 to-indigo-900 text-white">
                    {/* Admin Panel Title/Logo inside sidebar (optional, but good for context) */}
                    <Link to="/admin" className="flex items-center ps-2.5 mb-5 mt-2">
                        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Admin Panel</span>
                    </Link>
                    <ul className="space-y-2 font-medium">
                        <li>
                            <Link
                                to="/admin"
                                className={`flex items-center p-2 rounded-lg group ${location.pathname === "/admin"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "hover:bg-gray-700"
                                    }`}
                            >
                                <svg
                                    className="w-5 h-5 transition duration-75 text-white group-hover:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 22 21"
                                >
                                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                </svg>
                                <span className="ms-3">Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin/form-management"
                                className={`flex items-center p-2 rounded-lg group ${location.pathname === "/admin/form-management"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "hover:bg-gray-700"
                                    }`}
                            >
                                <svg
                                    className="shrink-0 w-5 h-5 transition duration-75 text-white group-hover:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 18 18"
                                >
                                    <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">
                                    Quản lí giao diện Form
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin/form-request"
                                className={`flex items-center p-2 rounded-lg group ${location.pathname === "/admin/form-request"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "hover:bg-gray-700"
                                    }`}
                            >
                                <svg
                                    className="shrink-0 w-5 h-5 transition duration-75 text-white group-hover:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">
                                    Quản lí đơn đã nộp
                                </span>
                                <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                                    3
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/admin/student"
                                className={`flex items-center p-2 rounded-lg group ${location.pathname === "/admin/student"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "hover:bg-gray-700"
                                    }`}
                            >
                                <svg
                                    className="shrink-0 w-5 h-5 transition duration-75 text-white group-hover:text-white"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 20 18"
                                >
                                    <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                                </svg>
                                <span className="flex-1 ms-3 whitespace-nowrap">Students</span>
                            </Link>
                        </li>
                        <li onClick={() => logout()} className="flex items-center p-2 rounded-lg group hover:bg-gray-700 cursor-pointer">


                            <svg
                                className="shrink-0 w-5 h-5 transition duration-75 text-white group-hover:text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 18 20"
                            >
                                <path d="M17 5.923A1 1 0 0 0 16 5h-3V4a4 4 0 1 0-8 0v1H2a1 1 0 0 0-1 .923L.086 17.846A2 2 0 0 0 2.08 20h13.84a2 2 0 0 0 1.994-2.153L17 5.923ZM7 9a1 1 0 0 1-2 0V7h2v2Zm0-5a2 2 0 1 1 4 0v1H7V4Zm6 5a1 1 0 1 1-2 0V7h2v2Z" />
                            </svg>
                            <span className="flex-1 ms-3 whitespace-nowrap">Logout</span>

                        </li>
                    </ul>
                </div>
            </aside >

            {/* Main Content Area */}
            {/* Added a hamburger button for mobile to toggle sidebar */}
            <main className="p-4 sm:ml-64">
                <div className="block sm:hidden mb-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        type="button"
                        className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        aria-controls="sidebar-multi-level-sidebar"
                        aria-expanded={isOpen}
                    >
                        <span className="sr-only">Toggle sidebar</span>
                        <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                        </svg>
                    </button>
                </div>


                <Outlet />

            </main>
        </>
    );
};

export default LayoutAdmin;