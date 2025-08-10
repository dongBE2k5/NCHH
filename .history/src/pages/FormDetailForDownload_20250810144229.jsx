import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    XMarkIcon,
    PencilIcon,
    ArrowDownTrayIcon,
    DocumentMagnifyingGlassIcon,
    PencilSquareIcon,
    ArrowUturnLeftIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../service/BaseUrl';
import FormDetailStudent from './Student/FormDetailStudent';
import FormRequestService from '../service/FormRequestService';

// Đổi tên component cho phù hợp hơn
function FormDetailPage() {
    const { mssv, id: folderId, date } = useParams();
    const [forms, setForms] = useState([]);
    const [studentName, setStudentName] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoadingDownload, setIsLoadingDownload] = useState(false);
    const [loadingFormId, setLoadingFormId] = useState(null); // State để biết nút nào đang loading

    // State cho Toast & Modal (giữ nguyên)
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');
    const [modal, setModal] = useState(false);
    const [formId, setFormId] = useState(null);
    const [valueId, setValueId] = useState(null);

    // Hàm showCustomToast (giữ nguyên)
    const showCustomToast = (message, type = 'info') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 4000);
    };

    // useEffect để fetch dữ liệu (giữ nguyên)
    useEffect(() => {
        const fetchFormsInFolder = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/form-values/${mssv}/${folderId}/${date}`);
                const data = res.data;
                console.log(data);

                setForms(data || []);


                if (data && data.length > 0) {
                    setStudentName(data[0].student_name ?? mssv);

                } else {
                    setStudentName(mssv);
                }


            } catch (err) {
                console.error('Lỗi khi fetch dữ liệu:', err);
                showCustomToast("Lỗi khi tải dữ liệu biểu mẫu.", "error");
            }
        };
        fetchFormsInFolder();
    }, [mssv, folderId, date]);

    // Hàm handleDownloadForm (giữ nguyên logic, chỉ thêm setLoadingFormId)
    const handleDownloadForm = async (formRequestId) => {
        setIsLoadingDownload(true);
        setLoadingFormId(formRequestId); // Đánh dấu ID form đang được xử lý
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
            setLoadingFormId(null); // Reset ID
        }
    };

    // Toast UI (giữ nguyên)
    const getToastClasses = (type) => {
        switch (type) {
            case 'success': return { bg: 'bg-green-500', icon: <CheckCircleIcon className="h-6 w-6 text-white" /> };
            case 'error': return { bg: 'bg-red-500', icon: <ExclamationCircleIcon className="h-6 w-6 text-white" /> };
            case 'warning': return { bg: 'bg-orange-500', icon: <ExclamationCircleIcon className="h-6 w-6 text-white" /> };
            default: return { bg: 'bg-blue-500', icon: <InformationCircleIcon className="h-6 w-6 text-white" /> };
        }
    };
    const { bg: toastBgClass, icon: toastIcon } = getToastClasses(toastType);

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            {/* Custom Toast Notification */}
            {showToast && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-lg text-white ${toastBgClass} transition-all duration-300`}>
                    <div className="flex-shrink-0">{toastIcon}</div>
                    <div className="ml-3 text-sm font-medium">{toastMessage}</div>
                    <button onClick={() => setShowToast(false)} className="ml-auto -mx-1.5 -my-1.5 bg-white/20 text-white rounded-lg p-1.5 hover:bg-white/30 inline-flex h-8 w-8">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                        Chi Tiết Biểu Mẫu
                    </h1>
                    <p className="mt-2 text-lg text-slate-600">
                        Quản lý các biểu mẫu đã nộp của sinh viên: <strong className="text-indigo-600">{studentName}</strong>
                    </p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-slate-200/80">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-5">Danh sách Biểu mẫu</h2>

                    {forms.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-100/80">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tên Biểu mẫu</th>
                                        <th className="px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ngày nộp</th>
                                        <th className="px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {forms.map((form) => (

                                        <tr key={form.id} className="hover:bg-slate-50/70 transition-colors duration-200">
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-800 text-black">{form.form_type?.name}</div>
                                                <div className="text-xs text-slate-500 ">ID: {form.id}</div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">{form.created_at?.split('T')[0] || 'N/A'}</td>
                                            <td className="px-5 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                                <button
                                                    onClick={() => { setModal(true); setFormId(form.type_of_form_id); setValueId(form.id); }}
                                                    className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                                                >
                                                    <PencilIcon className="h-3.5 w-3.5" />
                                                    Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadForm(form.id)}
                                                    className={`inline-flex items-center justify-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all ${isLoadingDownload && loadingFormId === form.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                    disabled={isLoadingDownload && loadingFormId === form.id}
                                                >
                                                    {isLoadingDownload && loadingFormId === form.id ? (
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    ) : (
                                                        <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                                                    )}
                                                    Tải đơn
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
                            <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-400" />
                            <h3 className="mt-2 text-sm font-semibold text-slate-800">Không tìm thấy biểu mẫu</h3>
                            <p className="mt-1 text-sm text-slate-600">Không có biểu mẫu nào được tìm thấy cho sinh viên này.</p>
                        </div>
                    )}
                </div>

                {/* Notes and Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md border border-slate-200/80">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <PencilSquareIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            Ghi chú
                        </h3>

                        {forms.length > 0 && (
                            <div className="ml-6 mt-2 space-y-1">
                                {forms.map((form, index) => (
                                     <p key={index} className="text-slate-600 text-sm">
                                        {form.form_type.note}
                                    </p>
                                ))}
                            </div>
                        )}
                    
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/80 flex items-center justify-center">
                        <Link to="/search" className="w-full inline-flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all">
                            <ArrowUturnLeftIcon className="h-5 w-5" />
                            Quay lại
                        </Link>
                    </div>
                </div>

            </div>

            {/* Modal */}
            {modal && (
                <div onClick={(e) => { if (e.target === e.currentTarget) { setModal(false); } }} className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-3xl h-full max-h-[90vh] rounded-lg shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-gray-800">Sửa thông tin đơn</h2>
                            <button onClick={() => setModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6">
                            <FormDetailStudent selectedId={formId} isEdit={true} valueID={valueId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FormDetailPage;