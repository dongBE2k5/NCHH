// FormSearch.jsx (giữ nguyên như bạn đã cung cấp)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from "framer-motion";
import { API_BASE_URL } from '../service/BaseUrl';
import {
    DocumentTextIcon,
    MagnifyingGlassIcon,
    ArrowRightIcon,
    CalendarDaysIcon,
    ExclamationTriangleIcon,
    FolderIcon,
} from "@heroicons/react/24/solid";

// Component con để hiển thị một mục biểu mẫu trên dòng thời gian (đã loại bỏ nút "Xem chi tiết")
const TimelineItem = ({ item }) => (
    <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative pl-12"
    >
        {/* Dấu chấm trên dòng thời gian */}
        <div className="absolute left-3 top-1 h-4 w-4 bg-blue-500 rounded-full border-4 border-slate-100"></div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="font-bold text-slate-800">{item.formName}</p>
            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-slate-500 mt-2">
                <span><span className="font-medium">ID:</span> {item.id}</span>
                <span><span className="font-medium">MSSV:</span> {item.studentCode}</span>
            </div>
        </div>
    </motion.div>
);

function FormSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [searchAttempted, setSearchAttempted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchAttempted(true);
        setIsLoading(true);
        setError(null);
        setResults([]);

        if (!searchTerm.trim()) {
            setError("Vui lòng nhập Mã số sinh viên.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/form-value/${searchTerm.trim()}`);
            const data = response.data;
            
            // Bước 1: Nhóm tất cả kết quả theo ngày
            const groupedByDate = data.reduce((acc, form) => {
                const date = new Date(form.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
                const dateKey = new Date(form.created_at).toISOString().split('T')[0];

                if (!acc[dateKey]) {
                    acc[dateKey] = {
                        date: date,
                        dateKey: dateKey,
                        forms: []
                    };
                }
                acc[dateKey].forms.push(form);
                return acc;
            }, {});

            // Bước 2: Với mỗi ngày, nhóm các biểu mẫu theo thư mục
            const timelineData = Object.values(groupedByDate).map(dayGroup => {
                const groupedByFolder = dayGroup.forms.reduce((acc, form) => {
                    const folderId = form.form_type?.folder?.id || 'no-folder';
                    const folderName = form.form_type?.folder?.name || 'Chưa phân loại';

                    if (!acc[folderId]) {
                        acc[folderId] = {
                            folderId: `folder-${folderId}`,
                            folderName: folderName,
                            forms: []
                        };
                    }

                    acc[folderId].forms.push({
                        id: form.id,
                        studentCode: form.values && form.values.length > 0 ? form.values[0].student_code : 'N/A',
                        formName: form.form_type?.name || 'Không có tên biểu mẫu',
                        date: form.created_at ? new Date(form.created_at).toLocaleDateString('vi-VN') : 'N/A',
                        formRequestId: form.form_type?.folder?.id || null,
                    });
                    return acc;
                }, {});
                
                return {
                    ...dayGroup,
                    folders: Object.values(groupedByFolder).sort((a, b) => a.folderName.localeCompare(b.folderName))
                };
            }).sort((a, b) => b.dateKey.localeCompare(a.dateKey));


            setResults(timelineData);

            if (timelineData.length === 0) {
                setError("Không tìm thấy biểu mẫu nào với Mã số sinh viên này.");
            }

        } catch (err) {
            console.error("Lỗi khi tìm kiếm:", err);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Đã có lỗi từ máy chủ khi tìm kiếm.");
            } else {
                setError("Đã có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
            }
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const convertDateFormat = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const handleViewDetail = (studentCode, formRequestId, date) => {
        console.log("studentCode", studentCode);
        console.log("formRequestId", formRequestId);
        console.log("date", date);
        if (!studentCode || !formRequestId || !date || studentCode === 'N/A') {
            setError("Không đủ thông tin để xem chi tiết. Vui lòng kiểm tra lại dữ liệu.");
            return;
        }
        const formattedDate = convertDateFormat(date);
        navigate(`/download-form-detail/${studentCode}/${formRequestId}/${formattedDate}`);
    };
    
    // Hàm render dòng thời gian đã được nâng cấp
    const renderTimeline = (timelineData) => {
        return (
            <div className="relative">
                {/* Đường kẻ dọc của timeline */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 -z-10"></div>
                {timelineData.map((group) => (
                    <div key={group.dateKey} className="mb-8">
                        {/* Tiêu đề ngày */}
                        <div className="relative pl-12 mb-6">
                             <div className="absolute left-2 top-0 h-6 w-6 bg-slate-100 rounded-full flex items-center justify-center ring-4 ring-slate-50">
                                  <CalendarDaysIcon className="h-4 w-4 text-slate-500" />
                             </div>
                            <h3 className="font-bold text-xl text-slate-800 pt-0.5">{group.date}</h3>
                        </div>

                        {/* Nhóm theo thư mục */}
                        <div className="space-y-6">
                            {group.folders && group.folders.map(folder => (
                                <div key={folder.folderId}>
                                    {/* Tiêu đề thư mục và nút Xem chi tiết */}
                                    <div className="relative pl-12 mb-4">
                                        <div className="absolute left-3 top-1 h-4 w-4 bg-slate-400 rounded-full border-4 border-slate-100"></div>
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <FolderIcon className="h-5 w-5 text-slate-500" />
                                                <h4 className="font-semibold text-md text-slate-600">{folder.folderName}</h4>
                                            </div>
                                            {/* Nút "Xem chi tiết" được chuyển lên cấp độ thư mục */}
                                            {folder.forms && folder.forms.length > 0 && (
                                                <button
                                                    onClick={() => handleViewDetail(folder.forms[0].studentCode, folder.forms[0].formRequestId, folder.forms[0].date)}
                                                    className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ease-in-out"
                                                >
                                                    Xem chi tiết
                                                    <ArrowRightIcon className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Danh sách các form trong thư mục */}
                                    <div className="space-y-4">
                                        {folder.forms.map(item => (
                                            <TimelineItem key={item.id} item={item} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="font-sans min-h-screen bg-gray-50">
            <div className="container mx-auto px-52 py-10">
                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200">
                    <div className="text-center">
                        <DocumentTextIcon className="h-12 w-12 mx-auto text-blue-600" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-2">Tra Cứu Đơn Từ</h1>
                        <p className="text-slate-500 mt-2 mb-8">Nhập Mã số sinh viên để xem lịch sử các biểu mẫu đã nộp.</p>
                    </div>

                    <form onSubmit={handleSearch} className="mb-8 flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative w-full sm:flex-grow">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-4 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Nhập Mã số sinh viên (MSSV)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="p-3 pl-11 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-shadow"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg font-semibold text-base disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Đang tìm...</span>
                                </>
                            ) : "Tìm kiếm"}
                        </button>
                    </form>

                    {searchAttempted && (
                        <div className="mt-10">
                            {isLoading ? (
                                <div className="text-center text-slate-500">
                                    <p>Đang tải dữ liệu, vui lòng đợi...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center text-center text-red-700 text-base p-6 bg-red-50 border-2 border-dashed border-red-200 rounded-lg">
                                    <ExclamationTriangleIcon className="h-10 w-10 mb-2" />
                                    <span className="font-semibold">Đã xảy ra lỗi</span>
                                    <p>{error}</p>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="space-y-8">
                                    {renderTimeline(results)}
                                </div>
                            ) : (
                                <div className="text-center text-slate-600 text-base p-8 bg-slate-50/70 rounded-lg">
                                    <p className="font-semibold">Không tìm thấy kết quả</p>
                                    <p className="text-sm">Chưa có biểu mẫu nào được tìm thấy với mã số sinh viên này.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FormSearch;