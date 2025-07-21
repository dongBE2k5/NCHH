import React, { useState, useEffect, useMemo } from 'react';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    DocumentArrowDownIcon,
    LinkIcon
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

// Component chính của trang quản lý, đổi tên thành ShowFormRequest
function ShowFormRequest() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const FORMS_PER_PAGE = 10;

    useEffect(() => {
        const fetchForms = async () => {
            try {
                setLoading(true);
                // Sử dụng FormRequestService để lấy dữ liệu
                const response = await FormRequestService.fetchData();
                // SỬA LỖI: Đảm bảo setForms luôn nhận một mảng, ngay cả khi response.data là undefined
                setForms(response|| []);

            } catch (err) {
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchForms();
    }, []);
    console.log(forms);
    
    const filteredForms = useMemo(() => {
        // Lỗi xảy ra ở đây nếu `forms` là undefined. Việc khởi tạo useState([]) đã xử lý lần render đầu tiên.
        // Lỗi chỉ xảy ra nếu `setForms` được gọi với một giá trị không phải mảng.
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
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-6">Quản lý Đơn từ</h1>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    {/* Thanh công cụ: Tìm kiếm */}
                    <div className="mb-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo MSSV, tên đơn, thư mục..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
                                }}
                                className="p-2 pl-10 border border-slate-300 rounded-lg w-full max-w-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Bảng dữ liệu */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tên Đơn</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Thư mục</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">MSSV</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="flex flex-col gap-2">
                                                {form.url_docx && <a href={form.url_docx} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline"><LinkIcon className="h-4 w-4"/> URL</a>}
                                                {form.file_docx && <a href={`/path/to/files/${form.file_docx}`} download className="inline-flex items-center gap-1 text-blue-600 hover:underline"><DocumentArrowDownIcon className="h-4 w-4"/> File</a>}
                                                {!form.url_docx && !form.file_docx && <span>Không có</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={form.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <button className="text-blue-600 hover:text-blue-900" title="Xem"><EyeIcon className="h-5 w-5"/></button>
                                                <button className="text-slate-600 hover:text-slate-900" title="Sửa"><PencilIcon className="h-5 w-5"/></button>
                                                <button className="text-red-600 hover:text-red-900" title="Xóa"><TrashIcon className="h-5 w-5"/></button>
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

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="py-4 flex items-center justify-between">
                            <span className="text-sm text-slate-700">
                                Hiển thị {indexOfFirstForm + 1} - {Math.min(indexOfLastForm, filteredForms.length)} của {filteredForms.length} kết quả
                            </span>
                            <div className="flex items-center gap-2">
                                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeftIcon className="h-5 w-5"/>
                                </button>
                                <span className="text-sm font-medium">{currentPage} / {totalPages}</span>
                                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronRightIcon className="h-5 w-5"/>
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
