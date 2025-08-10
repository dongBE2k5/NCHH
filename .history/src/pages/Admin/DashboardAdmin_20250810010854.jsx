import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, Clock, Users, Bell, TrendingUp, BarChart2, Settings, ListChecks } from 'lucide-react';

// 1. Import DashBoardSevice
import DashBoardSevice from '../../service/DashBoardSevice';

const DashboardAdmin = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalForms: 0,
        pendingForms: 0,
        approvedForms: 0,
        totalUsers: 0,
    });

    // Dữ liệu hoạt động gần đây vẫn có thể dùng dữ liệu giả nếu API chưa có
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 2. Gọi API song song để tăng hiệu suất bằng Promise.all
                const [
                    totalFormsData,
                    pendingFormsData,
                    approvedFormsData,
                    totalUsersData
                ] = await Promise.all([
                    DashBoardSevice.fetchAll(),     // Lấy tổng số đơn
                    DashBoardSevice.fetchWaiting(), // Lấy đơn đang chờ
                    DashBoardSevice.fetchSuccess(), // Lấy đơn đã duyệt
                    DashBoardSevice.fetchAccount(), // Lấy tổng số người dùng
                ]);

                // 3. Cập nhật state với dữ liệu từ API
                // Giả định API trả về trực tiếp các con số
                setStats({
                    totalForms: totalFormsData,
                    pendingForms: pendingFormsData,
                    approvedForms: approvedFormsData,
                    totalUsers: totalUsersData,
                });

                // LƯU Ý: API service của bạn chưa có endpoint cho "Hoạt động gần đây".
                // Tạm thời vẫn sử dụng dữ liệu giả cho phần này.
                // Khi có API, bạn có thể gọi và cập nhật `setRecentActivities` ở đây.
                const fetchedActivities = [
                    { id: 1, type: 'Đơn mới', description: 'Đơn xin nghỉ học từ Nguyễn Văn A', time: '5 phút trước', status: 'pending' },
                    { id: 2, type: 'Cập nhật', description: 'Đơn cấp lại thẻ SV của Trần Thị B đã được duyệt', time: '1 giờ trước', status: 'approved' },
                    { id: 3, type: 'Đơn mới', description: 'Đơn phúc khảo điểm từ Lê Văn C', time: '2 giờ trước', status: 'pending' },
                ];
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
                {/* ... Các phần còn lại của component không thay đổi ... */}
                {/* ... Bạn có thể dán phần còn lại của UI vào đây ... */}
            </div>
        </div>
    );
};

export default DashboardAdmin;