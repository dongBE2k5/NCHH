import React, { useState } from "react";
import { motion } from 'framer-motion';
import axios from 'axios'; // Import axios

function ApplicationStatusPage() {
    // applicationStatus will now be an ARRAY of applications fetched from the API
    const [applicationStatus, setApplicationStatus] = useState(null); 
    const [studentId, setStudentId] = useState("");
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(null); 

    const handleSearch = async () => {
        // Basic validation for student ID input
        if (!studentId.trim()) {
            setError("Vui lòng nhập Mã số sinh viên.");
            setApplicationStatus(null);
            return;
        }

        setIsLoading(true); // Set loading state to true
        setError(null); // Clear any previous errors
        setApplicationStatus(null); // Reset previous application status

        try {
            // Make an API call to the backend
            const response = await axios.get(`http://localhost:8000/api/request-students/search/${studentId.trim()}`);
            const result = response.data; // Assuming the API returns JSON data directly

            console.log("API response:", result);

            // Check if the result contains an array of applications
            if (result && Array.isArray(result) && result.length > 0) {
                // Map the API response structure to fit the component's expected structure
                const formattedApplications = result.map(item => ({
                    id: item.id,
                    formName: item.folder.name || "N/A", // Assuming API returns type_of_form_name
                    studentId: item.student_code,
                    studentName: item.student.name || "N/A",
                    submissionDate: item.created_at, // Use created_at directly, will format in render
                    status: item.status || "N/A",
                    note: item.note || "Không có" // Assuming API returns a 'note' field
                }));
                setApplicationStatus(formattedApplications); // Store the array of applications
            } else {
                setApplicationStatus([]); // Set to empty array if no applications found
                setError("Không tìm thấy đơn nào với Mã số sinh viên này.");
            }

        } catch (err) {
            console.error("Lỗi khi tìm kiếm trạng thái đơn từ API:", err);
            // Handle different types of errors (e.g., network error, server error)
            if (err.response) {
                // Server responded with a status other than 2xx
                setError(err.response.data.message || "Đã có lỗi từ máy chủ. Vui lòng thử lại.");
            } else if (err.request) {
                // Request was made but no response was received
                setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
            } else {
                // Something else happened while setting up the request
                setError("Đã có lỗi xảy ra khi tìm kiếm trạng thái đơn. Vui lòng thử lại.");
            }
            setApplicationStatus(null); // Clear applications on error
        } finally {
            setIsLoading(false); // Always set loading to false after request completes
        }
    };

    // Helper function to get Tailwind CSS classes based on status
    const getStatusClasses = (status) => {
        switch (status) {
            case 'Chờ duyệt':
                return 'bg-yellow-200 text-yellow-800';
            case 'Đã duyệt':
                return 'bg-green-200 text-green-800';
            case 'Từ chối':
            case 'Đã hủy': // Assuming "Đã hủy" also uses red styling
                return 'bg-red-200 text-red-800';
            case 'Bổ sung': // Assuming "Bổ sung" uses orange styling
                return 'bg-orange-200 text-orange-800';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    return (
        <div className="font-sans min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm py-4">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-blue-700">Tra Cứu Trạng Thái Đơn Học Vụ</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tra Cứu Trạng Thái Đơn</h2>
                    <p className="text-gray-600 mb-6 text-center">
                        Nhập Mã số sinh viên của bạn để xem trạng thái tất cả các đơn học vụ đã nộp.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <input
                            type="text"
                            placeholder="Nhập Mã số sinh viên (ví dụ: 20510001)"
                            className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            aria-label="Mã số sinh viên"
                        />
                        <motion.button
                            onClick={handleSearch}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-transform flex-shrink-0"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Tìm kiếm"
                            )}
                        </motion.button>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-600 text-center mb-4 p-2 bg-red-100 rounded-md"
                        >
                            {error}
                        </motion.p>
                    )}

                    {/* Check if applicationStatus is an array and has elements */}
                    {applicationStatus && applicationStatus.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="mt-8 border-t border-gray-200 pt-6 overflow-x-auto" // Add overflow-x-auto for table on small screens
                        >
                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Kết Quả Tra Cứu</h3>
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 border-b">Mã đơn</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 border-b">Loại đơn</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 border-b">Mã SV</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 border-b">Tên SV</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 border-b">Ngày nộp</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 border-b">Trạng thái</th>
                                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600 border-b">Ghi chú</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicationStatus.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 border-b last:border-b-0">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{app.id}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{app.formName || "N/A"}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{app.studentId}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{app.studentName || "N/A"}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                                                {/* Format the date for display */}
                                                {app.submissionDate ? new Date(app.submissionDate).toLocaleDateString('vi-VN') : "N/A"}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-800">{app.note || "Không có"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                    {/* Display message when no applications are found after a successful search (applicationStatus is an empty array) */}
                    {applicationStatus && applicationStatus.length === 0 && !error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-600 text-center mt-8 p-4 bg-blue-50 rounded-md"
                        >
                            Không tìm thấy đơn nào với Mã số sinh viên này.
                        </motion.p>
                    )}
                </motion.div>
            </main>
        </div>
    );
}

export default ApplicationStatusPage;
