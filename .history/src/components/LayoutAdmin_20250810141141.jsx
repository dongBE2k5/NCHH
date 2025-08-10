import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    HomeIcon,
    Squares2X2Icon,
    DocumentTextIcon,
    UsersIcon,
    DocumentCheckIcon,
    ArrowLeftOnRectangleIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';

// --- Dữ liệu cho các mục điều hướng trong Sidebar ---
// Việc tách dữ liệu này ra giúp code dễ quản lý và mở rộng hơn.
const navItems = [
    { href: '/admin', icon: HomeIcon, label: 'Dashboard' },
    { href: '/admin/form-management', icon: Squares2X2Icon, label: 'Quản lí giao diện Form' },
    { href: '/admin/form-request', icon: DocumentTextIcon, label: 'Quản lí đơn đã nộp', badge: 0 },
    { href: '/admin/student', icon: UsersIcon, label: 'Students' },
    { href: '/admin/request', icon: DocumentCheckIcon, label: 'Biểu mẫu đã nhận' },
];

// --- Component SidebarItem ---
// Component con để hiển thị mỗi mục trong sidebar
const SidebarItem = ({ item, isActive }) => (
    <li>
        <Link
            to={item.href}
            className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                : 'text-gray-300 hover:bg-blue-700 hover:text-white'
            }`}
        >
            <item.icon className="w-6 h-6 shrink-0" />
            <span className="flex-1 ms-3 whitespace-nowrap">{item.label}</span>
            {item.badge && (
                <span className="inline-flex items-center justify-center w-6 h-6 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                    {item.badge}
                </span>
            )}
        </Link>
    </li>
);

// --- Component Sidebar ---
const Sidebar = ({ isOpen, setIsOpen, handleLogout }) => {
    const location = useLocation();

    return (
        <>
            {/* Lớp phủ cho màn hình di động */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            ></div>
            
            {/* Sidebar chính */}
            <aside
                className={`fixed top-0 left-0 z-40 w-64 h-screen bg-blue-800 text-white transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Phần Header của Sidebar */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-blue-700">
                        <Link to="/admin" className="flex items-center gap-3">
                            <Squares2X2Icon className="h-7 w-7 text-blue-300" />
                            <span className="text-xl font-semibold">Admin Panel</span>
                        </Link>
                        <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 -mr-2">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Danh sách điều hướng */}
                    <nav className="flex-1 px-3 py-4 overflow-y-auto">
                        <ul className="space-y-1 font-medium">
                            {navItems.map(item => (
                                <SidebarItem 
                                    key={item.href} 
                                    item={item} 
                                    isActive={location.pathname === item.href}
                                />
                            ))}
                        </ul>
                    </nav>

                    {/* Phần chân Sidebar (Thông tin người dùng & Đăng xuất) */}
                    <div className="px-3 py-4 mt-auto border-t border-blue-700">
                         <div className="flex items-center p-3 rounded-lg text-gray-300">
                            <img 
                                className="w-10 h-10 rounded-full object-cover" 
                                src={`https://i.pravatar.cc/150?u=admin`}
                                alt="User Avatar" 
                            />
                            <div className="ms-3">
                                <p className="font-semibold text-white text-sm">Admin User</p>
                                <p className="text-xs text-gray-400">admin@example.com</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full p-3 mt-2 text-gray-300 rounded-lg transition-colors duration-200 hover:bg-red-500/80 hover:text-white group"
                        >
                            <ArrowLeftOnRectangleIcon className="w-6 h-6 shrink-0" />
                            <span className="flex-1 ms-3 whitespace-nowrap">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

// --- Component Header ---
const Header = ({ setIsOpen }) => {
    return (
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg shadow-sm lg:hidden">
            <div className="flex items-center justify-between h-16 px-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-gray-600 rounded-md hover:bg-gray-100"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
                 <Link to="/admin" className="flex items-center gap-2">
                    <Squares2X2Icon className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-semibold text-gray-800">Admin Panel</span>
                </Link>
                <div className="w-10"></div> {/* Spacer */}
            </div>
        </header>
    );
};


// --- Component LoadingScreen ---
const LoadingScreen = () => (
    <div className="flex items-center justify-center h-screen bg-blue-900">
        <div className="flex flex-col items-center">
            <div className="relative flex justify-center items-center">
                <div className="absolute w-24 h-24 rounded-full animate-spin border-4 border-dashed border-blue-400"></div>
                <Squares2X2Icon className="w-12 h-12 text-white animate-pulse" />
            </div>
            <p className="mt-6 text-lg text-white tracking-widest">ĐANG TẢI...</p>
        </div>
    </div>
);

// --- Component chính LayoutAdmin ---
export default function LayoutAdmin() {
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
        } else {
            // Giả lập thời gian tải dữ liệu
            setTimeout(() => {
                setLoading(false);
            }, 1000); // Giảm thời gian chờ
        }
    }, [navigate]);

    // Đóng sidebar khi chuyển trang trên di động
    useEffect(() => {
        if (isOpen) {
            setIsOpen(false);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        // Xóa thông tin đăng nhập khỏi localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("token_type");
        localStorage.removeItem("roles");
        
        // Chuyển hướng về trang đăng nhập
        navigate('/login');
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} handleLogout={handleLogout} />
            <div className="lg:ml-64 flex flex-col h-screen">
                <Header setIsOpen={setIsOpen} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {/* Outlet sẽ render các component con của route */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
