import React, { useState, useEffect } from 'react';
import {
    XMarkIcon,
    PlusCircleIcon,
    ChevronRightIcon,
    FolderIcon,
    UserIcon,
    DocumentDuplicateIcon // Icon để biểu thị các yêu cầu được gộp
} from '@heroicons/react/24/outline';
import FormRequestService from '../service/FormRequestService';

const QuickAddFormRequest = ({ show, onClose, onSubmit }) => {

    const [allRequests, setAllRequests] = useState([]);
    const [groupedRequests, setGroupedRequests] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [selectedRequestIds, setSelectedRequestIds] = useState(new Set());
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const fetchedData = await FormRequestService.fetchData();
                if (!Array.isArray(fetchedData)) {
                    throw new Error("Dữ liệu trả về từ API không phải là một mảng!");
                }

                const processedRequests = fetchedData.map(item => ({
                    id: item.id,
                    formTypeName: item.form_type?.name ?? 'N/A',
                    folderName: item.form_type?.folder?.name ?? 'Chưa phân loại',
                    folderId: item.form_type?.folder?.id,
                    studentCode: item.values?.[0]?.student_code ?? 'N/A',
                    studentName: item.values?.[0]?.student?.name ?? 'N/A',
                    createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'N/A'
                }));

                setAllRequests(processedRequests);

                // === Logic gộp dữ liệu ===
                const groups = processedRequests.reduce((acc, req) => {
                    const key = `${req.studentCode}-${req.createdAt}-${req.folderId}`;
                    if (!acc[key]) {
                        acc[key] = {
                            id: key,
                            studentCode: req.studentCode,
                            studentName: req.studentName,
                            createdAt: req.createdAt,
                            folderName: req.folderName,
                            requests: [],
                        };
                    }
                    acc[key].requests.push(req);
                    return acc;
                }, {});

                setGroupedRequests(Object.values(groups));

            } catch (error) {
                console.error("Lỗi khi tải hoặc xử lý dữ liệu:", error);
                setAllRequests([]);
                setGroupedRequests([]);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const toggleRow = (rowId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(rowId)) {
                newSet.delete(rowId);
            } else {
                newSet.add(rowId);
            }
            return newSet;
        });
    };

    const toggleSelection = (ids, shouldSelect) => {
        setSelectedRequestIds(prev => {
            const newSet = new Set(prev);
            ids.forEach(id => shouldSelect ? newSet.add(id) : newSet.delete(id));
            return newSet;
        });
    };

    const getGroupSelectionState = (groupRequests) => {
        const ids = groupRequests.map(req => req.id);
        if (ids.length === 0) return 'none';
        const selectedCount = ids.filter(id => selectedRequestIds.has(id)).length;
        if (selectedCount === 0) return 'none';
        if (selectedCount === ids.length) return 'all';
        return 'some';
    };

    const handleSelectAll = () => {
        const allIds = filteredAndGroupedRequests.flatMap(group => group.requests.map(req => req.id));
        const allSelected = allIds.every(id => selectedRequestIds.has(id));

        toggleSelection(allIds, !allSelected);
    };

    const filteredAndGroupedRequests = groupedRequests.filter(group =>
        group.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.folderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.requests.some(req => req.formTypeName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSubmit = () => {
        if (selectedRequestIds.size === 0) {
            alert('Vui lòng chọn ít nhất một đơn để thêm nhanh.');
            return;
        }

        const dataToSubmit = [...selectedRequestIds].map(id => {
            const req = allRequests.find(r => r.id === id);
            if (!req) {
                console.error(`Không tìm thấy request với id: ${id}`);
                return null;
            }
            return {
                student_code: req.studentCode,
                idfolder: req.folderId,
                type_of_form_id: req.id,
            };
        }).filter(Boolean);

        onSubmit(dataToSubmit);
    };

    return (

        <>
            {!show ? null : (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center p-5 border-b border-slate-200">
                                    <h2 className="text-xl font-bold text-slate-800">Thêm Nhanh (Gộp Yêu Cầu Trùng)</h2>
                                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100">
                                        <XMarkIcon className="h-6 w-6 text-slate-600" />
                                    </button>
                                </div>

                                <div className="p-4 border-b border-slate-200">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên đơn, tên SV, MSSV, hoặc thư mục..."
                                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex-grow overflow-auto p-6">
                                    {isLoadingData ? (
                                        <p className="p-4 text-center text-slate-500">Đang tải...</p>
                                    ) : filteredAndGroupedRequests.length > 0 ? (
                                        <table className="min-w-full">
                                            <thead className="bg-slate-50 sticky top-0 z-10">
                                                <tr>
                                                    <th scope="col" className="w-12 px-4 py-3 text-center">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded"
                                                            checked={
                                                                selectedRequestIds.size > 0 &&
                                                                filteredAndGroupedRequests.flatMap(g => g.requests).every(req => selectedRequestIds.has(req.id))
                                                            }
                                                            onChange={handleSelectAll}
                                                        />
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sinh viên</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Thư mục</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tổng số đơn</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày Tạo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white">
                                                {filteredAndGroupedRequests.map(group => {
                                                    const groupSelectionState = getGroupSelectionState(group.requests);

                                                    return (
                                                        <React.Fragment key={group.id}>
                                                            <tr
                                                                className={`cursor-pointer hover:bg-slate-50 ${groupSelectionState !== 'none' ? 'bg-slate-100' : ''}`}
                                                                onClick={() => toggleRow(group.id)}
                                                            >
                                                                <td className="px-4 py-2 text-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="h-4 w-4 rounded border-slate-400"
                                                                        ref={el => el && (el.indeterminate = groupSelectionState === 'some')}
                                                                        checked={groupSelectionState === 'all'}
                                                                        onChange={(e) => { e.stopPropagation(); toggleSelection(group.requests.map(r => r.id), e.target.checked); }}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-2 text-sm font-medium text-slate-800">
                                                                    <div className="flex items-center">
                                                                        <ChevronRightIcon
                                                                            className={`h-4 w-4 mr-1 transition-transform ${expandedRows.has(group.id) ? 'rotate-90' : ''}`}
                                                                        />
                                                                        <UserIcon className="h-5 w-5 mr-2 text-slate-500" />
                                                                        <span>{group.studentName} ({group.studentCode})</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-slate-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <FolderIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                                                        <span>{group.folderName}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-slate-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <DocumentDuplicateIcon className="h-4 w-4 text-slate-400" />
                                                                        <span>{group.requests.length} đơn</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-2 text-sm text-slate-500">{group.createdAt}</td>
                                                            </tr>
                                                            {/* Hiển thị các đơn con khi hàng được mở rộng */}
                                                            {expandedRows.has(group.id) && group.requests.map(request => (
                                                                <tr
                                                                    key={request.id}
                                                                    className={`hover:bg-slate-200 cursor-pointer ${selectedRequestIds.has(request.id) ? 'bg-slate-200' : 'bg-slate-100'}`}
                                                                    onClick={() => toggleSelection([request.id], !selectedRequestIds.has(request.id))}
                                                                >
                                                                    <td className="px-4 py-2 text-center">
                                                                        <div className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 flex items-center justify-center">
                                                                            {selectedRequestIds.has(request.id) && (
                                                                                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-slate-700 pl-12">
                                                                        <span>{request.formTypeName}</span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-slate-500"></td>
                                                                    <td className="px-4 py-2 text-sm text-slate-500"></td>
                                                                    <td className="px-4 py-2 text-sm text-slate-500"></td>
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="p-4 text-center text-slate-500">Không tìm thấy yêu cầu nào.</p>
                                    )}
                                </div>

                                <div className="flex justify-end items-center p-5 border-t border-slate-200 bg-slate-50">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={selectedRequestIds.size === 0}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        <PlusCircleIcon className="h-5 w-5" />
                                        Thêm Nhanh ({selectedRequestIds.size}) Yêu Cầu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuickAddFormRequest;