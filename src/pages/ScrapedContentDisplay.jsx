// src/components/ScrapedContentDisplay.js
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { API_BASE_URL } from '../service/BaseUrl';
function ScrapedContentDisplay() {
    const [scrapedData, setScrapedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // CHUYỂN THÀNH STATE ĐỂ NGƯỜI DÙNG CÓ THỂ NHẬP
    const [inputUrl, setInputUrl] = useState('https://online.tdc.edu.vn/Portlets/Uis_Myspace/Professor/Marks.aspx?StudentID=23211tt1467'); 
    const [inputSelector, setInputSelector] = useState('td.studyprogram_semeter_dl');

    // Sử dụng useCallback để memoize hàm fetchData, tránh re-render không cần thiết
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setScrapedData(null); // Xóa dữ liệu cũ

        // Kiểm tra xem người dùng đã nhập đủ thông tin chưa
        if (!inputUrl.trim() || !inputSelector.trim()) {
            setError("Vui lòng nhập đầy đủ URL và CSS Selector.");
            setIsLoading(false);
            return;
        }

        try {
            // Đảm bảo cổng là 4000 như bạn đã cấu hình trong server.js
            // Và đường dẫn là /api/scrape-element
            const backendUrl = `${API_BASE_URL}/scrape-element?url=${encodeURIComponent(inputUrl.trim())}&selector=${encodeURIComponent(inputSelector.trim())}`;
            
            console.log("Đang gửi yêu cầu đến backend:", backendUrl);
            const response = await fetch(backendUrl);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || `Lỗi HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setScrapedData(result.data);
                console.log("Dữ liệu đã trích xuất thành công:", result.data);
            } else {
                setError(result.message || "Không tìm thấy phần tử.");
                console.warn("Backend báo cáo không thành công:", result.message);
            }

        } catch (err) {
            setError(`Không thể lấy dữ liệu: ${err.message}`);
            console.error("Lỗi khi fetch dữ liệu từ backend:", err);
        } finally {
            setIsLoading(false);
        }
    }, [inputUrl, inputSelector]); // Hàm fetchData sẽ được tạo lại khi inputUrl hoặc inputSelector thay đổi

    // Chạy fetchData khi component mount hoặc khi inputUrl/inputSelector thay đổi
    // Tuy nhiên, với nút "Trích xuất Dữ liệu", có thể chỉ cần chạy nó khi nút được nhấn
    // Nếu bạn muốn nó tự động chạy khi trang tải, giữ useEffect này
    useEffect(() => {
        // Chỉ chạy fetch ban đầu nếu cả hai trường có giá trị mặc định
        if (inputUrl.trim() && inputSelector.trim()) {
            fetchData();
        }
    }, [fetchData, inputUrl, inputSelector]); // Thêm fetchData vào dependency array vì nó là useCallback

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">Trích xuất nội dung từ Web</h1>

            <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl mx-auto mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Cấu hình trích xuất</h2>
                
                <div className="mb-4">
                    <label htmlFor="inputUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        URL Trang Web Mục Tiêu:
                    </label>
                    <input
                        type="text"
                        id="inputUrl"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        placeholder="Ví dụ: https://example.com/data"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="inputSelector" className="block text-sm font-medium text-gray-700 mb-1">
                        CSS Selector của Phần Tử Cần Lấy:
                    </label>
                    <input
                        type="text"
                        id="inputSelector"
                        className="w-full p-3 border border-gray-300 rounded-md font-mono focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                        value={inputSelector}
                        onChange={(e) => setInputSelector(e.target.value)}
                        placeholder="Ví dụ: .my-class span, #someId div"
                    />
                    <p className="text-xs text-gray-500 mt-1">Sử dụng công cụ kiểm tra phần tử của trình duyệt (F12) để tìm selector.</p>
                </div>

                <button
                    onClick={fetchData} // Gọi fetchData khi nhấn nút
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        "Trích xuất Dữ liệu"
                    )}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-3xl mx-auto mb-6" role="alert">
                    <strong className="font-bold">Lỗi!</strong>
                    <span className="block sm:inline"> {error}</span>
                </div>
            )}

            {scrapedData && (
                <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Nội dung đã trích xuất:</h3>
                    <p className="text-lg text-gray-900 break-words bg-gray-50 p-4 rounded-md border border-gray-200">
                        {scrapedData}
                    </p>
                </div>
            )}
        </div>
    );
}

export default ScrapedContentDisplay;