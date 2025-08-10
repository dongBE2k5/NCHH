import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import các icon từ lucide-react
import { FileText, CheckCircle, Clock, Users, Bell, TrendingUp, BarChart2, Settings, ListChecks, FilePlus, Edit, Trash2 } from 'lucide-react';
import DashBoardSevice from '../../service/DashBoardSevice';

const DashboardAdmin = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalForms: 0,
        pendingForms: 0,
        approvedForms: 0,
        totalUsers: 0,
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [
                    totalFormsData, 
                    waitingFormsData, 
                    successFormsData, 
                    totalUsersData
                ] = await Promise.all([
                    DashBoardSevice.fetchAll(),
                    DashBoardSevice.fetchWaiting(),
                    DashBoardSevice.fetchSuccess(),
                    DashBoardSevice.fetchAccount(),
                ]);

                const fetchedStats = {
                    totalForms: totalFormsData,
                    pendingForms: waitingFormsData,
                    approvedForms: successFormsData,
                    totalUsers: totalUsersData,
                };
                
                const fetchedActivities = [
                    { id: 1, type: 'Đơn mới', description: 'Đơn xin nghỉ học từ Nguyễn Văn A', time: '5 phút trước', status: 'pending' },
                    { id: 2, type: 'Cập nhật', description: 'Đơn cấp lại thẻ SV của Trần Thị B đã được duyệt', time: '1 giờ trước', status: 'approved' },
                    { id: 3, type: 'Đơn mới', description: 'Đơn phúc khảo điểm từ Lê Văn C', time: '2 giờ trước', status: 'pending' },
                    { id: 4, type: 'Xóa', description: 'Mẫu đơn "Khảo sát ý kiến" đã bị xóa', time: '1 ngày trước', status: 'deleted' },
                    { id: 5, type: 'Đơn mới', description: 'Đơn xin chuyển ngành từ Phạm Thị D', time: '1 ngày trước', status: 'pending' },
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
    }, []);

    // Component Card thống kê
    const StatCard = ({ icon, title, value, color }) => {
        const colorClasses = {
            blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
            yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
            green: { bg: 'bg-green-100', text: 'text-green-600' },
            purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
        };
        const selectedColor = colorClasses[color] || colorClasses.blue;
        const IconComponent = icon;

        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${selectedColor.bg} ${selectedColor.text}`}>
                        <IconComponent size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">{title}</p>
                        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        );
    };

    // Component cho mỗi dòng hoạt động
    const ActivityItem = ({ icon, description, time, tag, color }) => {
        const IconComponent = icon;
        return (
            <li className="py-4 flex items-center space-x-4">
                <div className={`p-3 rounded-full ${color.bg} ${color.text}`}>
                    <IconComponent size={20} />
                </div>
                <div className="flex-grow">
                    <p className="text-gray-800 font-medium">{description}</p>
                    <p className="text-gray-500 text-sm">{time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color.bg} ${color.text}`}>
                    {tag}
                </span>
            </li>
        );
    };

    // Hàm để lấy icon và màu sắc cho hoạt động
    const getActivityDetails = (status) => {
        switch (status) {
            case 'pending':
                return { icon: FilePlus, tag: 'Đơn mới', color: { bg: 'bg-yellow-100', text: 'text-yellow-600' } };
            case 'approved':
                return { icon: CheckCircle, tag: 'Đã duyệt', color: { bg: 'bg-green-100', text: 'text-green-600' } };
            case 'deleted':
                return { icon: Trash2, tag: 'Đã xóa', color: { bg: 'bg-red-100', text: 'text-red-600' } };
            case 'Cập nhật': // Giả định từ dữ liệu cũ
                return { icon: Edit, tag: 'Cập nhật', color: { bg: 'bg-blue-100', text: 'text-blue-600' } };
            default:
                return { icon: Bell, tag: 'Thông báo', color: { bg: 'bg-gray-100', text: 'text-gray-600' } };
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
            <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
                    <strong className="font-bold">Lỗi!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tổng quan Dashboard</h1>
                    <p className="mt-1 text-gray-600">Chào mừng trở lại! Dưới đây là tổng quan hệ thống của bạn.</p>
                </div>

                {/* Phần thống kê tổng quan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={FileText} title="Tổng số đơn" value={stats.totalForms} color="blue" />
                    <StatCard icon={Clock} title="Đơn đang chờ" value={stats.pendingForms} color="yellow" />
                    <StatCard icon={CheckCircle} title="Đơn đã duyệt" value={stats.approvedForms} color="green" />
                    <StatCard icon={Users} title="Tổng số người dùng" value={stats.totalUsers} color="purple" />
                </div>

                {/* Phần hoạt động gần đây và hành động nhanh */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Hoạt động gần đây */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Bell size={22} className="mr-3 text-blue-500" /> Hoạt động gần đây
                        </h2>
                        {recentActivities.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-8">Không có hoạt động gần đây nào.</p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {recentActivities.map(activity => {
                                    const details = getActivityDetails(activity.status);
                                    return (
                                        <ActivityItem 
                                            key={activity.id}
                                            icon={details.icon}
                                            description={activity.description}
                                            time={activity.time}
                                            tag={details.tag}
                                            color={details.color}
                                        />
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Hành động nhanh */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <ListChecks size={22} className="mr-3 text-green-500" /> Hành động nhanh
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/admin/form-management')}
                                className="w-full flex items-center p-4 bg-gray-50 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg shadow-sm transition-all duration-200 ease-in-out"
                            >
                                <FileText size={20} className="mr-3" />
                                <span className="font-medium">Quản lý Mẫu đơn</span>
                            </button>
                            <button
                                onClick={() => navigate('/admin/users')}
                                className="w-full flex items-center p-4 bg-gray-50 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg shadow-sm transition-all duration-200 ease-in-out"
                            >
                                <Users size={20} className="mr-3" />
                                <span className="font-medium">Quản lý Người dùng</span>
                            </button>
                            <button
                                onClick={() => navigate('/admin/settings')}
                                className="w-full flex items-center p-4 bg-gray-50 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition-all duration-200 ease-in-out"
                            >
                                <Settings size={20} className="mr-3" />
                                <span className="font-medium">Cài đặt hệ thống</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Phần biểu đồ (placeholder) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <TrendingUp size={22} className="mr-3 text-orange-500" /> Thống kê theo thời gian
                    </h2>
                    <div className="h-64 bg-gray-50 flex items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                        <p>Biểu đồ sẽ hiển thị ở đây</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAdmin;
