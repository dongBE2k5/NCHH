// src/components/DocumentViewerPage.jsx

import React, { useState, useRef, useCallback } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css"; // Import CSS bắt buộc
import { ArrowLeftIcon, ArrowRightIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Icons

export default function DocumentViewerPage() {
    const [selectedDocs, setSelectedDocs] = useState([]); // State để lưu trữ các file đã chọn
    const [activeDocumentIndex, setActiveDocumentIndex] = useState(0); // Index của tài liệu đang hiển thị
    const docViewerRef = useRef(null); // Ref để điều khiển DocViewer

    // Hàm xử lý khi người dùng chọn file
    const handleFileChange = useCallback((event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            // Chuyển đổi File object thành định dạng mà DocViewer mong muốn
            const newDocs = files.map((file) => ({
                uri: window.URL.createObjectURL(file), // Tạo URL tạm thời cho file
                fileName: file.name, // Giữ tên file để hiển thị
                fileType: file.type, // Giữ loại file
            }));
            setSelectedDocs((prevDocs) => [...prevDocs, ...newDocs]); // Thêm vào danh sách hiện có
            // Nếu đây là lần đầu thêm file, đặt tài liệu đầu tiên làm active
            if (selectedDocs.length === 0) {
                setActiveDocumentIndex(0);
            }
        }
    }, []);

    // Hàm xử lý khi tài liệu thay đổi (do người dùng click hoặc điều hướng)
    const handleDocumentChange = useCallback((document) => {
        // Tìm index của tài liệu đang hoạt động để cập nhật activeDocumentIndex
        const index = selectedDocs.findIndex(doc => doc.uri === document.uri);
        if (index !== -1) {
            setActiveDocumentIndex(index);
        }
    }, [selectedDocs]);

    // Hàm xóa tài liệu khỏi danh sách
    const handleRemoveDocument = useCallback((indexToRemove) => {
        setSelectedDocs(prevDocs => {
            const updatedDocs = prevDocs.filter((_, index) => index !== indexToRemove);
            // Điều chỉnh activeDocumentIndex nếu tài liệu hiện tại bị xóa
            if (updatedDocs.length === 0) {
                setActiveDocumentIndex(0);
            } else if (indexToRemove <= activeDocumentIndex && activeDocumentIndex > 0) {
                setActiveDocumentIndex(prevIndex => prevIndex - 1);
            } else if (indexToRemove === activeDocumentIndex && activeDocumentIndex === 0 && updatedDocs.length > 0) {
                setActiveDocumentIndex(0); // Vẫn ở 0 nếu có tài liệu khác
            }
            return updatedDocs;
        });
    }, [activeDocumentIndex]);


    const currentDocument = selectedDocs[activeDocumentIndex];
    const totalDocuments = selectedDocs.length;

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Trình Xem Tài Liệu</h1>

            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    {/* Input tải file */}
                    <label htmlFor="file-upload" className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200 ease-in-out flex items-center space-x-2">
                        <DocumentIcon className="h-5 w-5" />
                        <span>Tải lên tài liệu</span>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                    {/* Điều hướng tài liệu */}
                    {totalDocuments > 1 && (
                        <div className="flex items-center space-x-3 text-gray-700">
                            <button
                                onClick={() => docViewerRef.current?.prev()}
                                disabled={activeDocumentIndex === 0}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </button>
                            <span>
                                {activeDocumentIndex + 1} / {totalDocuments}
                            </span>
                            <button
                                onClick={() => docViewerRef.current?.next()}
                                disabled={activeDocumentIndex >= totalDocuments - 1}
                                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                <ArrowRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Danh sách các file đã tải lên */}
                {selectedDocs.length > 0 && (
                    <div className="mb-6 border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Tài liệu đã tải lên:</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {selectedDocs.map((doc, index) => (
                                <li
                                    key={doc.uri} // Sử dụng uri làm key, hoặc một ID duy nhất hơn nếu có
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ease-in-out
                              ${index === activeDocumentIndex ? 'bg-indigo-100 border-indigo-400 shadow-md' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                                >
                                    <span className={`text-sm font-medium ${index === activeDocumentIndex ? 'text-indigo-800' : 'text-gray-700'}`}>
                                        <DocumentIcon className="inline h-4 w-4 mr-2 text-gray-500" />
                                        {doc.fileName}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveDocument(index)}
                                        className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors duration-200"
                                        title="Xóa tài liệu này"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Khu vực hiển thị DocViewer */}
                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden" style={{ height: "70vh", minHeight: "400px" }}>
                    {selectedDocs.length > 0 ? (
                        <DocViewer
                            ref={docViewerRef}
                            documents={selectedDocs}
                            initialActiveDocument={currentDocument} // Đảm bảo DocViewer hiển thị đúng tài liệu khi activeDocumentIndex thay đổi
                            onActiveDocumentChange={handleDocumentChange} // Cập nhật activeDocumentIndex khi DocViewer thay đổi tài liệu
                            pluginRenderers={DocViewerRenderers}
                            config={{
                                header: {
                                    disableHeader: false,
                                    disableFileName: false,
                                    retainURLParams: false,
                                },
                                csvDelimiter: ",",
                                pdfZoom: {
                                    defaultZoom: 0.9,
                                    zoomJump: 0.1,
                                },
                                loadingRenderer: {
                                    overrideComponent: ({ document, fileName }) => (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                            <ArrowPathIcon className="animate-spin h-10 w-10 text-indigo-500 mb-4" />
                                            <p className="text-lg font-medium">Đang tải {fileName || document?.fileType || "tài liệu"}...</p>
                                        </div>
                                    ),
                                    showLoadingTimeout: 200, // Hiển thị loading sau 200ms
                                },
                                noRenderer: {
                                    overrideComponent: ({ document, fileName }) => (
                                        <div className="flex flex-col items-center justify-center h-full text-red-500">
                                            <ExclamationTriangleIcon className="h-12 w-12 mb-4" />
                                            <p className="text-lg font-medium">Không thể hiển thị {fileName || document?.fileType || "tài liệu này"}.</p>
                                            <p className="text-sm mt-2 text-gray-600">Định dạng không được hỗ trợ hoặc file bị lỗi.</p>
                                        </div>
                                    ),
                                },
                            }}
                            theme={{
                                primary: "#4F46E5", // indigo-600
                                secondary: "#E0E7FF", // indigo-100
                                tertiary: "#6366F1", // indigo-500
                                textPrimary: "#1F2937", // gray-800
                                textSecondary: "#4B5563", // gray-600
                                textTertiary: "#9CA3AF", // gray-400
                                disableThemeScrollbar: false,
                            }}
                            requestHeaders={{
                                // "X-Access-Token": "YOUR_AUTH_TOKEN", // Thêm header nếu cần xác thực file
                            }}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                            <DocumentIcon className="h-20 w-20 mb-4 text-gray-300" />
                            <p className="text-lg text-center">Vui lòng tải lên tài liệu để xem.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}