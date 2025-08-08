import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    DocumentTextIcon,
    MagnifyingGlassIcon,
    ChartBarIcon,
    StarIcon,
    AcademicCapIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

function HomePage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="font-sans bg-gray-50 text-gray-800">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-28 sm:py-32 lg:py-40">
                <div
                    className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2032%2032%22%20width%3D%2232%22%20height%3D%2232%22%20fill%3D%22none%22%20stroke%3D%22rgb(255%20255%20255%20/%200.05)%22%3E%3Cpath%20d%3D%22M0%20.5H31.5V32%22%2F%3E%3C%2Fsvg%3E')] opacity-50">
                </div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight"
                    >
                        Quản Lý Học Vụ Dễ Dàng Hơn Bao Giờ Hết
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg sm:text-xl text-indigo-100 max-w-3xl mx-auto mb-10"
                    >
                        Nộp đơn, theo dõi trạng thái và truy cập tài liệu học vụ chỉ trong vài cú nhấp chuột.
                    </motion.p>
                    {/* --- ĐÃ SỬA --- 
                        Nút này giờ sẽ điều hướng trực tiếp đến trang nộp đơn */}
                    <motion.button
                        onClick={() => navigate("/form-user")}
                        whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-yellow-400 text-blue-800 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-yellow-300 transition-all duration-300"
                    >
                        Bắt đầu nộp đơn
                    </motion.button>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 sm:py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Hệ thống toàn diện cho Sinh viên</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Mọi thứ bạn cần cho các thủ tục học vụ đều có ở đây.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => navigate("/form-user")}
                            className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-center cursor-pointer border border-gray-100"
                        >
                            <div className="flex items-center justify-center h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl mx-auto mb-6">
                                <DocumentTextIcon className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2 text-gray-900">Nộp Đơn Trực Tuyến</h4>
                            <p className="text-gray-600">Gửi đơn học vụ nhanh chóng với các mẫu đơn có sẵn, giao diện thân thiện.</p>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => navigate("/status")}
                            className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-center cursor-pointer border border-gray-100"
                        >
                            <div className="flex items-center justify-center h-16 w-16 bg-green-100 text-green-600 rounded-2xl mx-auto mb-6">
                                <ChartBarIcon className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2 text-gray-900">Theo Dõi Trạng Thái</h4>
                            <p className="text-gray-600">Cập nhật tiến độ xử lý đơn của bạn theo thời gian thực, không cần chờ đợi.</p>
                        </motion.div>
                        
                        <motion.div
                            whileHover={{ y: -8, scale: 1.02 }}
                            onClick={() => navigate("/search")}
                            className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-center cursor-pointer border border-gray-100"
                        >
                            <div className="flex items-center justify-center h-16 w-16 bg-purple-100 text-purple-600 rounded-2xl mx-auto mb-6">
                                <MagnifyingGlassIcon className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-semibold mb-2 text-gray-900">Tra Cứu Thông Tin</h4>
                            <p className="text-gray-600">Dễ dàng tìm kiếm và xem lại lịch sử các đơn đã nộp một cách tiện lợi.</p>
                        </motion.div>
                    </div>
                </div>
            </section>
            
            {/* Stats Section */}
            <section className="py-20 sm:py-24 bg-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
                            <StarIcon className="h-10 w-10 mx-auto mb-3 text-yellow-500" />
                            <h4 className="text-4xl font-bold text-blue-600">10,000+</h4>
                            <p className="text-gray-600 mt-2">Đơn học vụ đã được xử lý thành công</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }}>
                            <AcademicCapIcon className="h-10 w-10 mx-auto mb-3 text-green-600" />
                            <h4 className="text-4xl font-bold text-blue-600">98%</h4>
                            <p className="text-gray-600 mt-2">Tỷ lệ sinh viên hài lòng với hệ thống</p>
                        </motion.div>
                         <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} viewport={{ once: true }}>
                            <ClockIcon className="h-10 w-10 mx-auto mb-3 text-red-600" />
                            <h4 className="text-4xl font-bold text-blue-600">24/7</h4>
                            <p className="text-gray-600 mt-2">Hệ thống hoạt động, hỗ trợ mọi lúc</p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
