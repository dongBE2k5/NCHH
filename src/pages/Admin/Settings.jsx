import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Database, Shield } from 'lucide-react'; // Import icons from lucide-react

const Settings = () => {
    // State để quản lý tab hiện tại
    const [activeTab, setActiveTab] = useState('general');

    // State cho các cài đặt giả định
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'Hệ thống Quản lý Học vụ',
        adminEmail: 'admin@example.com',
        dateFormat: 'DD/MM/YYYY',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        newFormAlert: true,
        approvedFormAlert: true,
    });

    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        passwordExpiration: 90, // days
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        // Mô phỏng việc tải cài đặt từ API
        const fetchSettings = async () => {
            setLoading(true);
            setError(null);
            try {
                await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập độ trễ

                // Dữ liệu cài đặt giả định
                const fetchedGeneral = {
                    siteName: 'Hệ thống Quản lý Học vụ',
                    adminEmail: 'admin@example.com',
                    dateFormat: 'DD/MM/YYYY',
                };
                const fetchedNotifications = {
                    emailNotifications: true,
                    smsNotifications: false,
                    newFormAlert: true,
                    approvedFormAlert: true,
                };
                const fetchedSecurity = {
                    twoFactorAuth: false,
                    passwordExpiration: 90,
                };

                setGeneralSettings(fetchedGeneral);
                setNotificationSettings(fetchedNotifications);
                setSecuritySettings(fetchedSecurity);

            } catch (err) {
                console.error("Lỗi khi tải cài đặt:", err);
                setError("Không thể tải cài đặt. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleGeneralChange = (e) => {
        const { name, value } = e.target;
        setGeneralSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleNotificationChange = (e) => {
        const { name, checked, value, type } = e.target;
        setNotificationSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSecurityChange = (e) => {
        const { name, checked, value, type } = e.target;
        setSecuritySettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage(null);
        setError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập lưu API

            // Trong thực tế, bạn sẽ gửi dữ liệu cài đặt lên backend
            console.log('Lưu cài đặt chung:', generalSettings);
            console.log('Lưu cài đặt thông báo:', notificationSettings);
            console.log('Lưu cài đặt bảo mật:', securitySettings);

            setSuccessMessage('Cài đặt đã được lưu thành công!');
        } catch (err) {
            console.error("Lỗi khi lưu cài đặt:", err);
            setError("Lỗi khi lưu cài đặt. Vui lòng thử lại.");
        } finally {
            setSaving(false);
            setTimeout(() => {
                setSuccessMessage(null);
                setError(null);
            }, 3000); // Xóa thông báo sau 3 giây
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-gray-700 text-lg">Đang tải cài đặt...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8 flex items-center">
                    <SettingsIcon size={36} className="mr-3 text-blue-600" /> Cài đặt Hệ thống
                </h1>

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Thành công!</strong>
                        <span className="block sm:inline"> {successMessage}</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Lỗi!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar Tabs */}
                    <div className="md:w-1/4 bg-gray-50 rounded-lg p-4 shadow-inner">
                        <nav className="space-y-2">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`w-full text-left flex items-center p-3 rounded-md transition-colors duration-200 ${
                                    activeTab === 'general' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <SettingsIcon size={20} className="mr-3" />
                                Chung
                            </button>
                            <button
                                onClick={() => setActiveTab('notifications')}
                                className={`w-full text-left flex items-center p-3 rounded-md transition-colors duration-200 ${
                                    activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <Bell size={20} className="mr-3" />
                                Thông báo
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full text-left flex items-center p-3 rounded-md transition-colors duration-200 ${
                                    activeTab === 'security' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <Shield size={20} className="mr-3" />
                                Bảo mật
                            </button>
                            {/* Bạn có thể thêm nhiều tab khác ở đây */}
                            <button
                                onClick={() => setActiveTab('database')}
                                className={`w-full text-left flex items-center p-3 rounded-md transition-colors duration-200 ${
                                    activeTab === 'database' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <Database size={20} className="mr-3" />
                                Cơ sở dữ liệu
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="md:w-3/4 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <form onSubmit={handleSubmit}>
                            {activeTab === 'general' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Cài đặt Chung</h2>
                                    <div className="mb-4">
                                        <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">Tên trang web</label>
                                        <input
                                            type="text"
                                            id="siteName"
                                            name="siteName"
                                            value={generalSettings.siteName}
                                            onChange={handleGeneralChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">Email quản trị</label>
                                        <input
                                            type="email"
                                            id="adminEmail"
                                            name="adminEmail"
                                            value={generalSettings.adminEmail}
                                            onChange={handleGeneralChange}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">Định dạng ngày</label>
                                        <select
                                            id="dateFormat"
                                            name="dateFormat"
                                            value={generalSettings.dateFormat}
                                            onChange={handleGeneralChange}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                        >
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Cài đặt Thông báo</h2>
                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="checkbox"
                                            id="emailNotifications"
                                            name="emailNotifications"
                                            checked={notificationSettings.emailNotifications}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">Nhận thông báo qua Email</label>
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="checkbox"
                                            id="smsNotifications"
                                            name="smsNotifications"
                                            checked={notificationSettings.smsNotifications}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">Nhận thông báo qua SMS</label>
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="checkbox"
                                            id="newFormAlert"
                                            name="newFormAlert"
                                            checked={notificationSettings.newFormAlert}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="newFormAlert" className="ml-2 block text-sm text-gray-900">Thông báo khi có đơn mới</label>
                                    </div>
                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="checkbox"
                                            id="approvedFormAlert"
                                            name="approvedFormAlert"
                                            checked={notificationSettings.approvedFormAlert}
                                            onChange={handleNotificationChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="approvedFormAlert" className="ml-2 block text-sm text-gray-900">Thông báo khi đơn được duyệt</label>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Cài đặt Bảo mật</h2>
                                    <div className="mb-4 flex items-center">
                                        <input
                                            type="checkbox"
                                            id="twoFactorAuth"
                                            name="twoFactorAuth"
                                            checked={securitySettings.twoFactorAuth}
                                            onChange={handleSecurityChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-900">Xác thực hai yếu tố (2FA)</label>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="passwordExpiration" className="block text-sm font-medium text-gray-700 mb-1">Thời hạn mật khẩu (ngày)</label>
                                        <input
                                            type="number"
                                            id="passwordExpiration"
                                            name="passwordExpiration"
                                            value={securitySettings.passwordExpiration}
                                            onChange={handleSecurityChange}
                                            min="30"
                                            max="365"
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'database' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Cơ sở dữ liệu</h2>
                                    <p className="text-gray-600 mb-4">Các tùy chọn liên quan đến quản lý cơ sở dữ liệu sẽ được hiển thị tại đây.</p>
                                    <button
                                        type="button"
                                        onClick={() => alert('Chức năng sao lưu CSDL đang được phát triển!')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                    >
                                        Sao lưu CSDL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => alert('Chức năng tối ưu CSDL đang được phát triển!')}
                                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        Tối ưu CSDL
                                    </button>
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                                        saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                                >
                                    {saving ? (
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <SettingsIcon size={20} className="-ml-1 mr-2" />
                                    )}
                                    {saving ? 'Đang lưu...' : 'Lưu Cài đặt'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
