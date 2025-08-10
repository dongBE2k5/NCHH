// src/components/admin/FieldEditorModal.js

import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../service/BaseUrl';
import {
    PlusIcon, ArrowDownTrayIcon, PencilSquareIcon, TrashIcon, ListBulletIcon, DocumentTextIcon,
    EnvelopeIcon, HashtagIcon, Bars3BottomLeftIcon, CheckIcon, XMarkIcon
} from '@heroicons/react/24/solid';

const swalCustomClass = { /* ... dán class của bạn vào đây ... */ };
const dataTypeIcons = {
    text: <DocumentTextIcon className="h-5 w-5 text-blue-500" />,
    email: <EnvelopeIcon className="h-5 w-5 text-green-500" />,
    number: <HashtagIcon className="h-5 w-5 text-purple-500" />,
    textarea: <Bars3BottomLeftIcon className="h-5 w-5 text-orange-500" />,
    checkbox: <CheckIcon className="h-5 w-5 text-teal-500" />,
    radio: ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-red-500"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9z" /></svg>),
};


export default function FieldEditorModal({ formInfo, onClose }) {
    const [fieldsData, setFieldsData] = useState([]);
    const [customFields, setCustomFields] = useState([]);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [isFieldFormInEditMode, setIsFieldFormInEditMode] = useState(false);
    const [fieldToEdit, setFieldToEdit] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchFieldList = useCallback(async () => {
        if (!formInfo.id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/forms/${formInfo.id}`);
            if (!res.ok) throw new Error('Lỗi khi lấy danh sách trường');
            const data = await res.json();
            setFieldsData(Array.isArray(data.field_form) ? data.field_form : []);
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi Tải Dữ Liệu!', text: 'Không thể tải danh sách trường cho biểu mẫu này.', customClass: swalCustomClass });
            onClose(); // Đóng modal nếu có lỗi nghiêm trọng
        }
    }, [formInfo.id, onClose]);

    useEffect(() => {
        fetchFieldList();
    }, [fetchFieldList]);

    // Giữ nguyên tất cả các hàm xử lý của CreateFieldForm cũ ở đây
    // Ví dụ: storeCustomField, updateFieldForm, deleteField...
    // ...

    // JSX render giao diện
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                        <ListBulletIcon className="h-7 w-7" />
                        Chỉnh sửa trường: <span className="text-gray-900">{formInfo.name}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all">
                        <XMarkIcon className="h-7 w-7" />
                    </button>
                </div>
                <div className="flex-grow p-6 overflow-hidden">
                    <div className="flex h-full gap-6">
                        {/* Cột trái: Form thêm/sửa */}
                        <div className="w-full lg:w-1/3 h-full overflow-y-auto pr-3 custom-scrollbar">
                           {/* Dán toàn bộ JSX của Cột trái từ CreateFieldForm vào đây */}
                           {/* Ví dụ: Form với nút thêm trường, nút lưu... */}
                           <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                {isFieldFormInEditMode ? 'Chỉnh sửa trường' : 'Thêm trường mới'}
                            </h3>
                            {/* ... Form ... */}
                        </div>

                        {/* Cột phải: Danh sách trường */}
                        <div className="w-full lg:w-2/3 h-full overflow-y-auto border-l border-gray-200 pl-6 custom-scrollbar">
                            {/* Dán toàn bộ JSX của Cột phải từ CreateFieldForm vào đây */}
                            {/* Ví dụ: Danh sách các trường có sẵn... */}
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Các trường hiện có</h3>
                            {fieldsData.length > 0 ? (
                                fieldsData.map((field, index) => (
                                    <div key={field.id}> {/* ... Hiển thị 1 trường ... */} </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 p-8 mt-10">...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
             {/* Thêm style cho thanh cuộn nếu cần */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
            `}</style>
        </div>
    );
}