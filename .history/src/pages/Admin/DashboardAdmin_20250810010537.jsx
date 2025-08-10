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
    }, []);

    const StatCard = ({ icon: Icon, title, value, color }) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
        };
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
                <div className={`p-3 rounded-full ${colors[color]}`}>
                    <Icon size={28} />
                </div>
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
                </div>
            </div>
        );
    };

    const getActivityDetails = (status) => {
        switch (status) {
            case 'pending': return { tag: 'Đơn mới', color: 'text-yellow-600 bg-yellow-100', icon: FilePlus };
            case 'approved': return { tag: 'Cập nhật', color: 'text-green-600 bg-green-100', icon: CheckCircle };
            case 'deleted': return { tag: 'Xóa', color: 'text-red-600 bg-red-100', icon: Trash2 };
            default: return { tag: 'Cập nhật', color: 'text-blue-600 bg-blue-100', icon: Edit };
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
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-gray-800 text-center">Tổng quan Dashboard</h1>

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
                                    const Icon = details.icon;
                                    return (
                                        <li key={activity.id} className="py-4 flex items-center space-x-4">
                                            <div className={`p-3 rounded-full ${details.color}`}>
                                                <Icon size={20} />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-gray-800 font-medium">{activity.description}</p>
                                                <p className="text-gray-500 text-sm">{activity.time}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${details.color}`}>
                                                {details.tag}
                                            </span>
                                        </li>
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
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/admin/form-management')}
                                className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg shadow-sm transition-all duration-200"
                            >
                                <FileText size={24} className="mb-2" />
                                <span className="font-medium text-sm text-center">Quản lý Mẫu đơn</span>
                            </button>
                            <button
                                onClick={() => navigate('/admin/users')}
                                className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg shadow-sm transition-all duration-200"
                            >
                                <Users size={24} className="mb-2" />
                                <span className="font-medium text-sm text-center">Quản lý Người dùng</span>
                            </button>
                            <button
                                onClick={() => navigate('/admin/settings')}
                                className="flex flex-col items-center justify-center p-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow-sm transition-all duration-200"
                            >
                                <Settings size={24} className="mb-2" />
                                <span className="font-medium text-sm text-center">Cài đặt hệ thống</span>
                            </button>
                            <button
                                onClick={() => alert('Chức năng báo cáo đang được phát triển!')}
                                className="flex flex-col items-center justify-center p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg shadow-sm transition-all duration-200"
                            >
                                <BarChart2 size={24} className="mb-2" />
                                <span className="font-medium text-sm text-center">Xem Báo cáo</span>
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
