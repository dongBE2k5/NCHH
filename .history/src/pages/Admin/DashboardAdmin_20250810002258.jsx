import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import các icon từ lucide-react
// Đảm bảo bạn đã cài đặt lucide-react: npm install lucide-react hoặc yarn add lucide-react
import { FileText, CheckCircle, Clock, Users, Bell, TrendingUp, BarChart2, Settings, ListChecks } from 'lucide-react';
import DashBoardSe
const DashboardAdmin = () => {
    const navigate = useNavigate();

    // Dữ liệu giả định cho các số liệu thống kê
    const [stats, setStats] = useState({
        totalForms: 0,
        pendingForms: 0,
        approvedForms: 0,
        totalUsers: 0,
    });

    // Dữ liệu giả định cho hoạt động gần đây
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Mô phỏng việc tải dữ liệu từ API
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Giả lập độ trễ mạng
                await new Promise(resolve => setTimeout(resolve, 800));

                const fetchedStats = {
                    totalForms: 1250,
                    pendingForms: 85,
                    approvedForms: 1100,
                    totalUsers: 5200,
                };

                const fetchedActivities = [
                    { id: 1, type: 'Đơn mới', description: 'Đơn xin nghỉ học từ Nguyễn Văn A', time: '5 phút trước', status: 'pending' },
                    { id: 2, type: 'Cập nhật', description: 'Đơn cấp lại thẻ SV của Trần Thị B đã được duyệt', time: '1 giờ trước', status: 'approved' },
                    { id: 3, type: 'Đơn mới', description: 'Đơn phúc khảo điểm từ Lê Văn C', time: '2 giờ trước', status: 'pending' },
                    { id: 4, type: 'Xóa', description: 'Mẫu đơn "Khảo sát ý kiến" đã bị xóa', time: '1 ngày trước', status: 'deleted' },
                    { id: 5, type: 'Đơn mới', description: 'Đơn xin chuyển ngành từ Phạm Thị D', time: '1 ngày trước', status: 'pending' },
                    { id: 6, type: 'Cập nhật', description: 'Đơn xác nhận SV của Hoàng Văn E đã được xử lý', time: '2 ngày trước', status: 'approved' },
                ];

                setStats(fetchedStats);
                setRecentActivities(fetchedActivities);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu dashboard:", err);
                setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Chỉ chạy một lần khi component mount

    // Hàm để lấy màu sắc dựa trên trạng thái hoạt động
    const getActivityStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            case 'approved':
                return 'text-green-600 bg-green-100';
            case 'deleted':
                return 'text-red-600 bg-red-100';
            case 'Cập nhật':
                return 'text-blue-600 bg-blue-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-gray-700 text-lg">Đang tải Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-red-100 flex items-center justify-center p-6">
                <div className="bg-red-200 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
                    <strong className="font-bold">Lỗi!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Tổng quan Dashboard</h1>

                {/* Phần thống kê tổng quan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Card: Tổng số đơn */}
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105 hover:shadow-lg">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <FileText size={28} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tổng số đơn</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalForms.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Card: Đơn đang chờ */}
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105 hover:shadow-lg">
                        <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Đơn đang chờ</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.pendingForms.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Card: Đơn đã duyệt */}
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105 hover:shadow-lg">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <CheckCircle size={28} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Đơn đã duyệt</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.approvedForms.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Card: Tổng số người dùng */}
                    <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105 hover:shadow-lg">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tổng số người dùng</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Phần hoạt động gần đây và hành động nhanh */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Hoạt động gần đây */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <Bell size={24} className="mr-2 text-blue-500" /> Hoạt động gần đây
                        </h2>
                        {recentActivities.length === 0 ? (
                            <p className="text-gray-500 italic">Không có hoạt động gần đây nào.</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {recentActivities.map(activity => (
                                    <li key={activity.id} className="py-3 flex items-center justify-between">
                                        <div className="flex-grow">
                                            <p className="text-gray-800 font-medium">{activity.description}</p>
                                            <p className="text-gray-500 text-sm">{activity.time}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActivityStatusColor(activity.status)}`}>
                                            {activity.type}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Hành động nhanh */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <ListChecks size={24} className="mr-2 text-green-500" /> Hành động nhanh
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/admin/form-management')}
                                className="flex items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg shadow-sm transition-colors duration-200 ease-in-out transform hover:scale-105"
                            >
                                <FileText size={20} className="mr-2" />
                                Quản lý Mẫu đơn
                            </button>
                            <button
                                onClick={() => navigate('/admin/users')} // Giả định có route /admin/users
                                className="flex items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg shadow-sm transition-colors duration-200 ease-in-out transform hover:scale-105"
                            >
                                <Users size={20} className="mr-2" />
                                Quản lý Người dùng
                            </button>
                            <button
                                onClick={() => navigate('/admin/settings')} // Giả định có route /admin/settings
                                className="flex items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg shadow-sm transition-colors duration-200 ease-in-out transform hover:scale-105"
                            >
                                <Settings size={20} className="mr-2" />
                                Cài đặt hệ thống
                            </button>
                            <button
                                onClick={() => alert('Chức năng báo cáo đang được phát triển!')}
                                className="flex items-center justify-center p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg shadow-sm transition-colors duration-200 ease-in-out transform hover:scale-105"
                            >
                                <BarChart2 size={20} className="mr-2" />
                                Xem Báo cáo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Phần biểu đồ (placeholder) */}
                <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <TrendingUp size={24} className="mr-2 text-orange-500" /> Thống kê theo thời gian
                    </h2>
                    <div className="h-64 bg-gray-50 flex items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                        <p>Biểu đồ sẽ hiển thị ở đây (ví dụ: số lượng đơn theo tháng)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;
