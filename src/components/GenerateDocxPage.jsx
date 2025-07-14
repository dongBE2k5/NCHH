// src/components/DocxGeneratorForm.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';

function DocxGeneratorForm() {
    // Ví dụ về các trường dữ liệu mà bạn muốn đưa vào file docx
    const [studentName, setStudentName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA')); // YYYY-MM-DD for input type="date"

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Ngăn chặn hành vi mặc định của form (tải lại trang)

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Chuẩn bị dữ liệu để gửi đến backend.
        // Các key ở đây (name, id, reason, current_date) phải khớp với các biến trong document.docx
        // Ví dụ: {name}, {id}, {reason}, {current_date}
        const dataForDocx = {
            name: studentName,
            id: studentId,
            reason: reason,
            current_date: new Date(date).toLocaleDateString('vi-VN'), // Định dạng lại ngày tháng cho tiếng Việt
            // Thêm các trường dữ liệu khác mà bạn muốn có trong template docx
        };

        try {
            const response = await fetch('http://localhost:8000/api/google-drive/docx', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataForDocx),
            });

            if (!response.ok) {
                // Đọc lỗi từ backend nếu có
                const errorText = await response.text(); // Đọc dạng text vì có thể không phải JSON
                throw new Error(`Server returned an error: ${response.status} - ${errorText}`);
            }

            // Nếu thành công, response sẽ là một file (blob)
            const blob = await response.blob();
            
            // Tạo URL tạm thời cho blob
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = 'don_hoc_vu.docx'; // Tên file sẽ được tải về
            document.body.appendChild(link);
            link.click(); // Kích hoạt click để tải về
            link.remove(); // Xóa thẻ a sau khi tải xong
            window.URL.revokeObjectURL(downloadUrl); // Giải phóng URL tạm thời

            setSuccessMessage("Đơn đã được tạo và tải về thành công!");

        } catch (err) {
            console.error("Lỗi khi tạo và tải đơn:", err);
            setError(`Không thể tạo đơn: ${err.message}. Vui lòng thử lại.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-sans min-h-screen bg-gray-50 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto"
            >
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Tạo và In Đơn Học Vụ</h2>
                <p className="text-gray-600 mb-8 text-center">
                    Điền thông tin vào form để tạo file đơn DOCX tự động và tải về.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Họ và tên sinh viên</label>
                        <input
                            type="text"
                            id="studentName"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Mã số sinh viên</label>
                        <input
                            type="text"
                            id="studentId"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Lý do nộp đơn</label>
                        <textarea
                            id="reason"
                            rows="4"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Ngày làm đơn</label>
                        <input
                            type="date"
                            id="date"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
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

                    {successMessage && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-green-600 text-center mb-4 p-2 bg-green-100 rounded-md"
                        >
                            {successMessage}
                        </motion.p>
                    )}

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-transform flex items-center justify-center space-x-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L10 11.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v7a1 1 0 11-2 0V3a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span>{isLoading ? "Đang tạo..." : "Tạo và Tải Đơn"}</span>
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}

export default DocxGeneratorForm;