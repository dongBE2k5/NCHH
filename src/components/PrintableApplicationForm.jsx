import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../service/BaseUrl';


function PrintableDocxForm() {
    const [studentName, setStudentName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // Không còn cần state để lưu trữ HTML nữa vì chúng ta sẽ mở trực tiếp trên Google Docs
    // const [htmlContent, setHtmlContent] = useState(null); 

    // Không còn cần ref cho phần tử HTML in được nữa
    // const printableAreaRef = useRef(null); 

    const handleGenerateAndOpenInDrive = async (e) => { // Đổi tên hàm để phản ánh chức năng mới
        e.preventDefault();

        setIsLoading(true);
        setError(null);
        // setHtmlContent(null); // Không còn cần xóa nội dung HTML cũ

        const dataForDocx = {
            name: studentName,
            id: studentId,
            reason: reason,
            current_date: new Date(date).toLocaleDateString('vi-VN'),
        };

        try {
            // Gửi POST request đến backend để tạo DOCX, tải lên Google Drive và nhận URL
                const response = await fetch(`${API_BASE_URL}/generate-upload-and-print-via-drive`, { // <-- ENDPOINT MỚI
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataForDocx),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi HTTP: ${response.status}`);
            }

            const result = await response.json();
            if (result.success && result.googleDocsPrintUrl) { // Kiểm tra URL từ Google Docs
                // Mở URL trong một tab mới để người dùng có thể xem và in từ Google Docs
                window.open(result.googleDocsPrintUrl, '_blank');
                alert('Tài liệu đã được tạo và mở trên Google Docs. Vui lòng in từ đó.');
            } else {
                setError(result.message || "Backend không trả về URL Google Docs.");
            }

        } catch (err) {
            console.error("Lỗi khi tạo tài liệu và tải lên Google Drive:", err);
            setError(`Không thể tạo đơn hoặc mở trên Google Docs: ${err.message}.`);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm handlePrint không còn cần thiết vì việc in sẽ được thực hiện trên Google Docs
    // const handlePrint = () => { /* ... */ };

    return (
        <div className="font-sans min-h-screen bg-gray-50 py-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto"
            >
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Tạo Đơn & Mở trên Google Docs</h2>
                <p className="text-gray-600 mb-8 text-center">
                    Điền thông tin để tạo đơn từ mẫu DOCX và mở trực tiếp trên Google Docs để in.
                </p>

                {/* Form nhập liệu */}
                <form onSubmit={handleGenerateAndOpenInDrive} className="space-y-6 mb-8"> {/* Sử dụng hàm mới */}
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
                                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                                <path fillRule="evenodd" d="M.661 10.435A9.901 9.901 0 0110 3c2.463 0 4.752.922 6.44 2.453l1.79-1.789A1 1 0 1119 5.793l-1.789 1.79c1.531 1.688 2.453 3.977 2.453 6.44a9.901 9.901 0 01-7.435 9.339A9.99 9.99 0 0110 20c-4.418 0-8-3.582-8-8 0-2.463.922-4.752 2.453-6.44L.661 5.793a1 1 0 011.414-1.414l1.79 1.79C5.248 4.922 7.537 4 10 4z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span>{isLoading ? "Đang tạo & tải lên..." : "Tạo & Mở trên Google Docs"}</span> {/* Cập nhật text nút */}
                    </motion.button>
                </form>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-600 text-center mb-4 p-2 bg-red-100 rounded-md"
                    >
                        {error}
                    </motion.p>
                )}

                {/* Phần hiển thị HTML và nút In đã bị loại bỏ vì không còn cần thiết */}
                {/* {htmlContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-gray-100 p-8 rounded-lg shadow-inner max-w-full mx-auto mt-6"
                    >
                        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Nội dung Đơn (Xem trước để in)</h3>
                        <div
                            className="prose max-w-none border p-4 bg-white rounded-md docx-preview-area"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                            ref={printableAreaRef}
                        ></div>

                        <div className="flex justify-center mt-8">
                            <button
                                onClick={handlePrint}
                                className="bg-green-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-700 transition-transform flex items-center space-x-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>In Đơn Này</span>
                            </button>
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Lưu ý: Bố cục bản in có thể khác một chút so với hiển thị trên màn hình.
                        </p>
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => { setHtmlContent(null); setError(null); }}
                                className="text-blue-600 hover:underline px-4 py-2"
                            >
                                Chỉnh sửa lại thông tin
                            </button>
                        </div>
                    </motion.div>
                )} */}
            </motion.div>
        </div>
    );
}

export default PrintableDocxForm;
