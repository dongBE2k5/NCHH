import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../service/BaseUrl';
import FormDetailStudent from './Student/FormDetailStudent';
// FormRequestService có thể không cần thiết nữa nếu axios xử lý hết
// import FormRequestService from '../service/FormRequestService';

function FormDetailForPrint() {
    const { mssv, id: folderId, date } = useParams();
    const [forms, setForms] = useState([]);
    const [studentName, setStudentName] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoadingPrint, setIsLoadingPrint] = useState(false);
    const [printingFormId, setPrintingFormId] = useState(null); // Theo dõi ID của form đang in

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');

    const [modal, setModal] = useState(false);
    const [formId, setFormId] = useState(null);
    const [valueId, setValueId] = useState(null);

    const showCustomToast = (message, type = 'info') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 4000);
    };

    useEffect(() => {
        const fetchFormsInFolder = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/form-values/${mssv}/${folderId}/${date}`);
                const data = res.data;
                console.log("data", data);
                setForms(data || []);

                if (data && data.length > 0) {
                    setStudentName(data[0].student_name ?? mssv);
                } else {
                    setStudentName(mssv);
                }
                setNotes(`Ghi chú về sinh viên ${mssv} (demo).`);
            } catch (err) {
                console.error('Lỗi khi fetch dữ liệu:', err);
                showCustomToast("Lỗi khi tải dữ liệu biểu mẫu.", "error");
            }
        };
        fetchFormsInFolder();
    }, [mssv, folderId, date]);

    // << HÀM ĐÃ ĐƯỢC CẬP NHẬT LOGIC >>
    const handlePrintForm = async (formToPrint) => {
        setIsLoadingPrint(true);
        setPrintingFormId(formToPrint.id); // Đánh dấu form đang được xử lý
        
        // Mở tab mới ngay lập tức
        const newWindow = window.open('', '_blank');
        if (!newWindow) {
            showCustomToast("Trình duyệt đã chặn pop-up. Vui lòng cho phép pop-up.", "error");
            setIsLoadingPrint(false);
            setPrintingFormId(null);
            return;
        }
        newWindow.document.write('<p>Đang xử lý, vui lòng đợi...</p>');

        try {
            // Bước 1: Kiểm tra xem form đã có url_docx chưa
            if (formToPrint.url_docx) {
                // Nếu có, dùng luôn URL đó
                showCustomToast("Đã có file, đang mở...", "success");
                newWindow.location.href = formToPrint.url_docx;
            } else {
                // Nếu không, gọi API để tạo file mới
                showCustomToast("File chưa có, đang tạo file mới...", "info");
                const response = await axios.get(`${API_BASE_URL}/google-drive/generate-upload/${formToPrint.id}`);
                const result = response.data;
                
                if (result.success && result.url) {
                    showCustomToast("Tạo file thành công! Đang chuyển hướng...", "success");
                    newWindow.location.href = result.url;

                    // Cập nhật lại state `forms` để lần sau nhấn nút sẽ có URL ngay
                    setForms(prevForms => 
                        prevForms.map(f => 
                            f.id === formToPrint.id ? { ...f, url_docx: result.url } : f
                        )
                    );
                } else {
                    throw new Error(result.message || "Lỗi khi tạo và upload file.");
                }
            }
        } catch (error) {
            console.error("Lỗi khi xử lý in đơn:", error);
            const errorMessage = error.response?.data?.error || error.message || "Lỗi không xác định.";
            showCustomToast(`Lỗi: ${errorMessage}`, "error");
            newWindow.document.write(`<p style="color: red;">Lỗi: ${errorMessage}. Bạn có thể đóng tab này.</p>`);
        } finally {
            setIsLoadingPrint(false);
            setPrintingFormId(null);
        }
    };
    
    // Các hàm và JSX còn lại không thay đổi
    const getToastClasses = (type) => { /* ... */ };
    const { bg: toastBgClass, icon: toastIcon } = getToastClasses(toastType);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            {showToast && (
                <div className={`fixed top-4 right-4 z-[100] flex items-center p-4 rounded-lg shadow-lg text-white ${toastBgClass}`}>
                    {/* ... JSX của Toast ... */}
                </div>
            )}

            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-center mb-6 text-black">
                    Biểu mẫu trong Thư mục ({folderId}) - MSSV: {studentName}
                </h1>

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">Danh sách Biểu mẫu</h2>
                    {forms.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg shadow-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-sky-200">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">ID</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Tên Biểu mẫu</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Ngày nộp</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {forms.map((form) => {
                                        const createdDate = form.created_at?.split('T')[0] || '';
                                        const isLoadingThisForm = isLoadingPrint && printingFormId === form.id;
                                        return (
                                            <tr key={form.id} className="hover:bg-gray-50 text-black">
                                                <td className="px-6 py-4 text-center">{form.id}</td>
                                                <td className="px-6 py-4 text-center">{form.form_type?.name}</td>
                                                <td className="px-6 py-4 text-center">{createdDate}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => { setModal(true); setFormId(form.type_of_form_id); setValueId(form.id); }} className="bg-blue-600 text-white px-4 py-2 mr-2 rounded-md">
                                                        Sửa thông tin
                                                    </button>
                                                    <button
                                                        onClick={() => handlePrintForm(form)} // << TRUYỀN CẢ OBJECT `form` VÀO
                                                        className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition duration-200 ease-in-out ${isLoadingThisForm ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        disabled={isLoadingThisForm}
                                                    >
                                                        {isLoadingThisForm ? (
                                                            <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                        ) : (
                                                            "In Đơn"
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">Không có biểu mẫu nào trong thư mục này.</p>
                    )}
                </div>

                {/* ... Các phần còn lại của JSX không thay đổi ... */}
                {modal && ( /* ... */ )}
            </div>
        </div>
    );
}

export default FormDetailForPrint;