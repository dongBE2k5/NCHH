// src/components/admin/FieldEditorModal.js

import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../service/BaseUrl';
import {
    // << ĐÃ XÓA: PlusIcon, TrashIcon >>
    ArrowDownTrayIcon, PencilSquareIcon, ListBulletIcon, DocumentTextIcon,
    EnvelopeIcon, HashtagIcon, Bars3BottomLeftIcon, CheckIcon, XMarkIcon
} from '@heroicons/react/24/solid';

// Các hằng số giữ nguyên
const swalCustomClass = { /* ... */ };
const dataTypeIcons = { /* ... */ };

export default function FieldEditorModal({ formInfo, onClose }) {
    const [fieldsData, setFieldsData] = useState([]);
    // `customFields` giờ chỉ dùng để chứa dữ liệu của trường đang được sửa
    const [customFields, setCustomFields] = useState([]); 
    const [isSaving, setIsSaving] = useState(false);

    // State `isFieldFormInEditMode` và `fieldToEdit` vẫn cần thiết để biết đang sửa trường nào
    const [isFieldFormInEditMode, setIsFieldFormInEditMode] = useState(false);
    const [fieldToEdit, setFieldToEdit] = useState(null);

    // << CÁC HÀM ĐÃ BỊ LOẠI BỎ >>
    // - addCustomField
    // - storeCustomField
    // - deleteField

    const fetchFieldList = useCallback(async () => {
        if (!formInfo.id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/forms/${formInfo.id}`);
            if (!res.ok) throw new Error('Lỗi khi lấy danh sách trường');
            const data = await res.json();
            setFieldsData(Array.isArray(data.field_form) ? data.field_form.sort((a, b) => a.position - b.position) : []);
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi Tải Dữ Liệu!', text: 'Không thể tải danh sách trường.', customClass: swalCustomClass });
            onClose();
        }
    }, [formInfo.id, onClose]);

    useEffect(() => {
        fetchFieldList();
    }, [fetchFieldList]);
    
    // Hàm này được giữ lại để điền dữ liệu vào form sửa
    const handleEditField = useCallback((field) => {
        setIsFieldFormInEditMode(true);
        setFieldToEdit(field);
        setCustomFields([{ data_type: field.data_type, label: field.label, options: Array.isArray(field.options) ? field.options : [] }]);
    }, []);
    
    // Hàm này được giữ lại để cập nhật giá trị trong form sửa
    const handleCustomFieldChange = useCallback((index, fieldKey, value) => {
        setCustomFields(prevFields => {
            const updatedFields = [...prevFields];
            updatedFields[index] = { ...updatedFields[index], [fieldKey]: value };
            return updatedFields;
        });
    }, []);

    // Hàm updateFieldForm giờ là hàm lưu chính
    const updateFieldForm = useCallback(async () => {
        if (!isFieldFormInEditMode || !fieldToEdit || !formInfo.id || customFields.length === 0) return;
        
        setIsSaving(true);
        try {
            const fieldData = { ...customFields[0] };
            fieldData.options = Array.isArray(fieldData.options) ? fieldData.options : [];
            const res = await fetch(`${API_BASE_URL}/forms/${formInfo.id}/fields/${fieldToEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fieldData)
            });

            if (!res.ok) throw new Error('Cập nhật trường thất bại');

            await Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Trường đã được cập nhật.', timer: 1500, showConfirmButton: false, customClass: swalCustomClass });
            
            // Reset form chỉnh sửa
            setCustomFields([]);
            setIsFieldFormInEditMode(false);
            setFieldToEdit(null);

            // Tải lại danh sách
            fetchFieldList();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi!', text: `Không thể cập nhật trường: ${error.message}`, customClass: swalCustomClass });
        } finally {
            setIsSaving(false);
        }
    }, [isFieldFormInEditMode, customFields, fieldToEdit, formInfo.id, fetchFieldList]);

    const renderEditFieldForm = (field, index) => (
        <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            {/* Nội dung form sửa, giống hệt như trước */}
             <label className="block text-gray-700 text-sm font-medium mb-1 text-black">Kiểu dữ liệu:</label>
            <select onChange={(e) => handleCustomFieldChange(index, 'data_type', e.target.value)} value={field.data_type} className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm">
                <option value="text">Text (Văn bản)</option>
                <option value="email">Email</option>
                <option value="number">Number (Số)</option>
                <option value="textarea">Textarea (Văn bản dài)</option>
                <option value="checkbox">Checkbox (Hộp kiểm)</option>
                <option value="radio">Radio (Chọn một)</option>
            </select>
            <label className="block text-gray-700 text-sm font-medium mt-3 mb-1">Tên trường (Label):</label>
            <input type="text" value={field.label} onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm" placeholder="Ví dụ: Họ và tên, Ngày sinh..." />
            {['checkbox', 'radio'].includes(field.data_type) && (
                <div className="mt-3">
                    {/* ... JSX cho options ... */}
                </div>
            )}
        </div>
    );
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4 pt-16 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-3">
                        <PencilSquareIcon className="h-7 w-7" />
                        Chỉnh sửa trường: <span className="text-gray-900">{formInfo.name}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all">
                        <XMarkIcon className="h-7 w-7" />
                    </button>
                </div>

                <div className="flex-grow p-6 overflow-hidden">
                    <div className="flex h-full gap-6">
                        {/* Cột trái: Form sửa */}
                        <div className="w-full lg:w-1/3 h-full overflow-y-auto pr-3 custom-scrollbar">
                            {isFieldFormInEditMode ? (
                                <>
                                    <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                        Đang sửa: <span className="text-indigo-600">{fieldToEdit?.label}</span>
                                    </h3>
                                    {customFields.map(renderEditFieldForm)}
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={updateFieldForm}
                                            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex-grow disabled:bg-gray-400"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Đang cập nhật...' : <><ArrowDownTrayIcon className="h-5 w-5" /> Cập nhật trường</>}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { setCustomFields([]); setIsFieldFormInEditMode(false); setFieldToEdit(null); }} 
                                            className="p-2 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-300"
                                            title="Hủy chỉnh sửa"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center text-gray-500 p-8 mt-10 border-2 border-dashed rounded-lg bg-gray-50 h-full flex flex-col justify-center items-center">
                                    <PencilSquareIcon className="h-12 w-12 text-gray-400 mb-4" />
                                    <p className="font-medium">Chọn một trường để sửa</p>
                                    <p className="text-sm mt-1">Vui lòng nhấn vào biểu tượng cây bút chì ✏️ từ danh sách bên phải.</p>
                                </div>
                            )}
                        </div>

                        {/* Cột phải: Danh sách trường */}
                        <div className="w-full lg:w-2/3 h-full overflow-y-auto border-l border-gray-200 pl-6 custom-scrollbar">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Các trường hiện có</h3>
                            {fieldsData.length > 0 ? (
                                fieldsData.map((item) => (
                                    <div key={item.id} className="bg-gray-50 border rounded-lg p-3 flex justify-between items-center mb-2 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            {dataTypeIcons[item.data_type] || <DocumentTextIcon className="h-5 w-5 text-gray-500" />}
                                            <p className="font-medium text-gray-800">{item.label}</p>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <button 
                                                onClick={() => handleEditField(item)} 
                                                className="text-blue-600 hover:scale-125 transition-transform p-1"
                                                title="Sửa trường này"
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            {/* << ĐÃ XÓA: Nút xóa trường >> */}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 p-8 mt-10 border-2 border-dashed rounded-lg bg-gray-50">
                                    <p className="font-medium">Biểu mẫu này chưa có trường nào.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* ... style cho scrollbar ... */}
        </div>
    );
}