import React, { useState, useEffect, useMemo } from 'react';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpDownIcon, // Icon cho sắp xếp
    FunnelIcon, // Icon cho bộ lọc
    PlusIcon, // Icon cho nút thêm mới
    ArrowPathIcon // Icon cho nút tải lại
} from '@heroicons/react/24/outline';
import FormRequestService from '../../service/FormRequestService';

// Component StatusBadge được thiết kế lại một chút cho đẹp hơn
const StatusBadge = ({ status }) => {
    const statusStyles = {
        'Approved': 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-600/20',
        'Pending': 'bg-yellow-100 text-yellow-700 ring-1 ring-inset ring-yellow-600/20',
        'Rejected': 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20',
    };
    const style = statusStyles[status] || 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20';
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md inline-block ${style}`}>
            {status || 'Chưa cập nhật'}
        </span>
    );
};

// Component chính đã được nâng cấp
function ShowFormRequest() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State mới cho các tính năng nâng cao
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const FORMS_PER_PAGE = 8;

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

    useEffect(() => {
        fetchForms();
    }, []);

    const processedForms = useMemo(() => {
        let sortableForms = [...forms];

        // 1. Lọc theo trạng thái
        if (filterStatus !== 'All') {
            sortableForms = sortableForms.filter(form => form.status === filterStatus);
        }

        // 2. Lọc theo từ khóa tìm kiếm
        if (searchTerm) {
            sortableForms = sortableForms.filter(form => {
                const studentCode = form.values?.[0]?.student_code || '';
                const formName = form.form_type?.name || '';
                const folderName = form.form_type?.folder?.name || '';
                const lowerCaseSearchTerm = searchTerm.toLowerCase();
                return (
                    studentCode.toLowerCase().includes(lowerCaseSearchTerm) ||
                    formName.toLowerCase().includes(lowerCaseSearchTerm) ||
                    folderName.toLowerCase().includes(lowerCaseSearchTerm)
                );
            });
        }

        // 3. Sắp xếp
        if (sortConfig.key) {
            sortableForms.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Logic sắp xếp cho các trường lồng nhau
                if (sortConfig.key === 'form_name') {
                    aValue = a.form_type?.name || '';
                    bValue = b.form_type?.name || '';
                }
                if (sortConfig.key === 'student_code') {
                    aValue = a.values?.[0]?.student_code || '';
                    bValue = b.values?.[0]?.student_code || '';
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        
        return sortableForms;
    }, [forms, searchTerm, filterStatus, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    // Logic phân trang
    const indexOfLastForm = currentPage * FORMS_PER_PAGE;
    const indexOfFirstForm = indexOfLastForm - FORMS_PER_PAGE;
    const currentForms = processedForms.slice(indexOfFirstForm, indexOfLastForm);
    const totalPages = Math.ceil(processedForms.length / FORMS_PER_PAGE);

    // Component tiêu đề bảng có thể sắp xếp
    const SortableHeader = ({ label, sortKey }) => (
        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer select-none" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center gap-2">
                {label}
                <ChevronUpDownIcon className={`h-4 w-4 ${sortConfig.key === sortKey ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
        </th>
    );
    
    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-100 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Danh sách Đơn từ</h1>
                        <p className="mt-1 text-sm text-slate-600">Quản lý và theo dõi tất cả các đơn từ của sinh viên.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                        <PlusIcon className="h-5 w-5" />
                        Thêm Đơn Mới
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                        <div className="relative md:col-span-2">
                            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3.5 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo MSSV, tên đơn..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="p-2.5 pl-10 border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            />
                        </div>
                        <div className="relative">
                            <FunnelIcon className="h-5 w-5 text-slate-400 absolute top-1/2 left-3.5 -translate-y-1/2" />
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="p-2.5 pl-10 border border-slate-300 rounded-lg w-full appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            >
                                <option value="All">Tất cả trạng thái</option>
                                <option value="Pending">Đang chờ (Pending)</option>
                                <option value="Approved">Đã duyệt (Approved)</option>
                                <option value="Rejected">Từ chối (Rejected)</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto border-t border-slate-200">
                        {loading ? (
                             <div className="text-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-slate-600">Đang tải dữ liệu...</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">ID</th>
                                        <SortableHeader label="Tên Đơn" sortKey="form_name" />
                                        <SortableHeader label="MSSV" sortKey="student_code" />
                                        <SortableHeader label="Ngày gửi" sortKey="created_at" />
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Trạng thái</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {currentForms.map((form) => (
                                        <tr key={form.id} className="hover:bg-slate-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{form.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-slate-800">{form.form_type?.name || 'N/A'}</div>
                                                <div className="text-xs text-slate-500">{form.form_type?.folder?.name || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{form.values?.[0]?.student_code || 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {new Date(form.created_at).toLocaleString("vi-VN", { dateStyle: 'short', timeStyle: 'short' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={form.status} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-4">
                                                    <button className="text-slate-500 hover:text-blue-600 transition-colors" title="Xem chi tiết"><EyeIcon className="h-5 w-5" /></button>
                                                    <button className="text-slate-500 hover:text-green-600 transition-colors" title="Sửa"><PencilIcon className="h-5 w-5" /></button>
                                                    <button className="text-slate-500 hover:text-red-600 transition-colors" title="Xóa"><TrashIcon className="h-5 w-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {processedForms.length === 0 && !loading && (
                            <div className="text-center py-16 text-slate-500">
                                <p className="font-semibold">Không tìm thấy đơn từ nào.</p>
                                <p className="text-sm mt-1">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="py-4 flex items-center justify-between border-t border-slate-200 mt-2">
                            <span className="text-sm text-slate-700">
                                Hiển thị <strong>{indexOfFirstForm + 1}</strong> - <strong>{Math.min(indexOfLastForm, processedForms.length)}</strong> trên <strong>{processedForms.length}</strong> kết quả
                            </span>
                            <div className="inline-flex items-center -space-x-px rounded-md shadow-sm">
                                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50">
                                    <ChevronLeftIcon className="h-5 w-5" />
                                </button>
                                <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300">
                                    Trang {currentPage} / {totalPages}
                                </span>
                                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-500 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50">
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