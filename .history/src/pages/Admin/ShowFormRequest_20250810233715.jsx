import React, { useState, useEffect, useMemo } from 'react';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DocumentArrowDownIcon,
    LinkIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    PrinterIcon // 1. Import thêm icon máy in
} from '@heroicons/react/24/outline';
import FormRequestService from '../../service/FormRequestService';

// Component hiển thị trạng thái dưới dạng badge
const StatusBadge = ({ status }) => {
    const statusStyles = {
        'Approved': 'bg-green-100 text-green-800',
        'Pending': 'bg-yellow-100 text-yellow-800',
        'Rejected': 'bg-red-100 text-red-800',
    };
    const defaultStyle = 'bg-slate-100 text-slate-800';
    const style = status ? (statusStyles[status] || defaultStyle) : defaultStyle;
    return (
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full inline-block ${style}`}>
            {status || 'Chưa cập nhật'}
        </span>
    );
};


// Component chính của trang quản lý
function ShowFormRequest() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const FORMS_PER_PAGE = 10;

    // State cho chức năng tải file và toast
    const [isLoadingDownload, setIsLoadingDownload] = useState(false);
    const [loadingFormId, setLoadingFormId] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');

    useEffect(() => {
        const fetchForms = async () => {
            try {
                setLoading(true);
                const response = await FormRequestService.fetchData();
                setForms(response || []);
            } catch (err) {
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchForms();
    }, []);

    const filteredForms = useMemo(() => {
        return forms.filter(form => {
            const studentCode = form.values?.[0]?.student_code || '';
            const formName = form.form_type?.name || '';
            const folderName = form.form_type?.folder?.name || '';
            return (
                studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                folderName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }, [forms, searchTerm]);

    // Hàm hiển thị toast
    const showCustomToast = (message, type = 'info') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 4000);
    };

    // Hàm xử lý tải file
    const handleDownloadFile = async (formRequestId) => {
        setIsLoadingDownload(true);
        setLoadingFormId(formRequestId);
        showCustomToast("Đang xử lý yêu cầu...", "info");
        try {
            const checkResponse = await FormRequestService.getById(formRequestId);
            const fileDocx = checkResponse.file_docx;
            let downloadResult;

            if (fileDocx === null) {
                showCustomToast("File chưa tồn tại, đang tạo file mới...", "info");
                downloadResult = await FormRequestService.createdFile(formRequestId);
            } else {
                showCustomToast("File đã tồn tại, đang lấy link tải...", "info");
                downloadResult = await FormRequestService.getFile(fileDocx);
            }

            if (downloadResult && downloadResult.url) {
                showCustomToast(downloadResult.message || "Thành công! File đang được tải về.", "success");
                const link = document.createElement('a');
                link.href = downloadResult.url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error(downloadResult.message || "Không nhận được URL để tải file.");
            }
        } catch (error) {
            console.error("Lỗi trong quá trình tải file:", error);
            showCustomToast(error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.", "error");
        } finally {
            setIsLoadingDownload(false);
            setLoadingFormId(null);
        }
    };
    
    // Hàm lấy UI cho toast
    const getToastClasses = (type) => {
        switch (type) {
            case 'success': return { bg: 'bg-green-500', icon: <CheckCircleIcon className="h-6 w-6 text-white" /> };
            case 'error': return { bg: 'bg-red-500', icon: <ExclamationCircleIcon className="h-6 w-6 text-white" /> };
            default: return { bg: 'bg-blue-500', icon: <InformationCircleIcon className="h-6 w-6 text-white" /> };
        }
    };
    const { bg: toastBgClass, icon: toastIcon } = getToastClasses(toastType);

    // Logic phân trang
    const indexOfLastForm = currentPage * FORMS_PER_PAGE;
    const indexOfFirstForm = indexOfLastForm - FORMS_PER_PAGE;
    const currentForms = filteredForms.slice(indexOfFirstForm, indexOfLastForm);
    const totalPages = Math.ceil(filteredForms.length / FORMS_PER_PAGE);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) {
        return <div className="p-8 text-center">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
             {showToast && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-lg text-white ${toastBgClass} transition-all duration-300`}>
                    <div className="flex-shrink-0">{toastIcon}</div>
                    <div className="ml-3 text-sm font-medium">{toastMessage}</div>
                    <button onClick={() => setShowToast(false)} className="ml-auto -mx-1.5 -my-1.5 bg-white/20 text-white rounded-lg p-1.5 hover:bg-white/30 inline-flex h-8 w-8">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
            <div className="max-w-7xl mx-auto">
                {/* 2. TẠO FLEX CONTAINER CHO TIÊU ĐỀ VÀ NÚT MỚI */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý Đơn từ</h1>
                    <button
                        onClick={() => window.open('/search-admin', '_blank')}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
                    >
                        <PrinterIcon className="h-5 w-5" />
                        In Đơn Sinh Viên
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <div className="mb-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo MSSV, tên đơn, thư mục..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="p-2 pl-10 border border-slate-300 rounded-lg w-full max-w-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên Đơn</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Thư mục</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">MSSV</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ngày gửi</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tài liệu</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {currentForms.map((form) => (
                                    <tr key={form.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{form.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{form.form_type?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{form.form_type?.folder?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{form.values?.[0]?.student_code || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"> {new Date(form.created_at).toLocaleString("vi-VN", {
                                            timeZone: "Asia/Ho_Chi_Minh",
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit"
                                        })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="flex flex-col gap-2">
                                                {form.url_docx && <a href={form.url_docx} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline"><LinkIcon className="h-4 w-4" /> URL</a>}
                                                
                                                <button
                                                    onClick={() => handleDownloadFile(form.id)}
                                                    disabled={isLoadingDownload && loadingFormId === form.id}
                                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-wait text-left"
                                                >
                                                    {isLoadingDownload && loadingFormId === form.id ? (
                                                        <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <DocumentArrowDownIcon className="h-4 w-4" />
                                                    )}
                                                    Tải File
                                                </button>
                                                
                                                {!form.url_docx && !form.file_docx && <span>Không có</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={form.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <button className="text-blue-600 hover:text-blue-900" title="Xem"><EyeIcon className="h-5 w-5" /></button>
                                                <button className="text-slate-600 hover:text-slate-900" title="Sửa"><PencilIcon className="h-5 w-5" /></button>
                                                <button className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredForms.length === 0 && (
                            <div className="text-center py-8 text-slate-500">Không tìm thấy đơn từ nào.</div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="py-4 flex items-center justify-between">
                            <span className="text-sm text-slate-700">
                                Hiển thị {indexOfFirstForm + 1} - {Math.min(indexOfLastForm, filteredForms.length)} của {filteredForms.length} kết quả
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>
                                <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronRightIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ShowFormRequest;
