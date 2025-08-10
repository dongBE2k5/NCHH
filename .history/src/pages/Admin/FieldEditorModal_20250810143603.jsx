// src/components/admin/FieldEditorModal.js

import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../service/BaseUrl';
import {
    PlusIcon, ArrowDownTrayIcon, PencilSquareIcon, TrashIcon,
    ListBulletIcon, DocumentTextIcon, EnvelopeIcon, HashtagIcon,
    Bars3BottomLeftIcon, CheckIcon, XMarkIcon
} from '@heroicons/react/24/solid';

const swalCustomClass = {
    popup: 'rounded-lg shadow-xl',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200',
    cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200',
    title: 'text-blue-700 text-2xl font-bold',
    htmlContainer: 'text-gray-700 text-base',
};

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
            setFieldsData(Array.isArray(data.field_form) ? data.field_form.sort((a,b) => a.position - b.position) : []);
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi Tải Dữ Liệu!', text: 'Không thể tải danh sách trường cho biểu mẫu này.', customClass: swalCustomClass });
            onClose();
        }
    }, [formInfo.id, onClose]);

    useEffect(() => {
        fetchFieldList();
    }, [fetchFieldList]);

    const handleCustomFieldChange = useCallback((index, fieldKey, value) => {
        setCustomFields(prevFields => {
            const updatedFields = [...prevFields];
            updatedFields[index] = { ...updatedFields[index], [fieldKey]: value };
            return updatedFields;
        });
    }, []);

    const addCustomField = useCallback(() => {
        if (isFieldFormInEditMode) {
            setIsFieldFormInEditMode(false);
            setFieldToEdit(null);
        }
        setCustomFields([{ data_type: 'text', label: '', options: [] }]);
    }, [isFieldFormInEditMode]);
    
    const storeCustomField = useCallback(async () => {
        if (!formInfo.id || customFields.length === 0) return;
        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/forms/${formInfo.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type_of_form_id: formInfo.id,
                    fields: customFields.map(field => ({
                        ...field,
                        options: Array.isArray(field.options) ? field.options : []
                    }))
                }),
            });
            if (!response.ok) throw new Error('Lưu thất bại');
            await Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Các trường đã được lưu.', timer: 1500, showConfirmButton: false, customClass: swalCustomClass });
            setCustomFields([]);
            fetchFieldList();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi!', text: `Có lỗi xảy ra khi lưu: ${error.message}`, customClass: swalCustomClass });
        } finally {
            setIsSaving(false);
        }
    }, [formInfo.id, customFields, fetchFieldList]);

    const handleEditField = useCallback((field) => {
        setIsFieldFormInEditMode(true);
        setFieldToEdit(field);
        setCustomFields([{ data_type: field.data_type, label: field.label, options: Array.isArray(field.options) ? field.options : [] }]);
    }, []);

    const updateFieldForm = useCallback(async () => {
        if (!fieldToEdit || !formInfo.id || customFields.length === 0) return;
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
            setCustomFields([]);
            setIsFieldFormInEditMode(false);
            setFieldToEdit(null);
            fetchFieldList();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi!', text: `Không thể cập nhật trường: ${error.message}`, customClass: swalCustomClass });
        } finally {
            setIsSaving(false);
        }
    }, [customFields, fieldToEdit, formInfo.id, fetchFieldList]);

    const deleteField = useCallback(async (fieldId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?', text: "Bạn sẽ không thể hoàn tác thao tác này!", icon: 'warning',
            showCancelButton: true, confirmButtonText: 'Có, xóa nó!', cancelButtonText: 'Không, hủy bỏ!', customClass: swalCustomClass,
        });
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_BASE_URL}/forms/${formInfo.id}/fields/${fieldId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Xóa thất bại');
                Swal.fire({ icon: 'success', title: 'Đã xóa!', text: 'Trường đã được xóa thành công.', timer: 1500, showConfirmButton: false, customClass: swalCustomClass });
                fetchFieldList();
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Lỗi!', text: `Có lỗi khi xóa trường: ${error.message}`, customClass: swalCustomClass });
            }
        }
    }, [formInfo.id, fetchFieldList]);

    const handleSaveOrUpdate = () => {
        if (isFieldFormInEditMode) {
            updateFieldForm();
        } else {
            storeCustomField();
        }
    };

    const renderCustomFieldForm = (field, index) => (
        <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <label className="block text-gray-700 text-sm font-medium mb-1">Kiểu dữ liệu:</label>
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
                <div className="mt-3 p-3 bg-gray-100 rounded-md border border-gray-200">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Tùy chọn (Options):</label>
                    {(field.options || []).map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 mt-1">
                            <input type="text" value={option} onChange={(e) => { const updatedOptions = [...(field.options || [])]; updatedOptions[optIndex] = e.target.value; handleCustomFieldChange(index, 'options', updatedOptions); }} className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm" placeholder={`Lựa chọn ${optIndex + 1}`} />
                            <button type="button" onClick={() => { const updatedOptions = [...(field.options || [])]; updatedOptions.splice(optIndex, 1); handleCustomFieldChange(index, 'options', updatedOptions); }} className="text-red-600 hover:text-red-800"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                    ))}
                    <button type="button" onClick={() => { const updatedOptions = [...(field.options || []), '']; handleCustomFieldChange(index, 'options', updatedOptions); }} className="mt-3 text-blue-600 hover:underline text-sm flex items-center gap-1"><PlusIcon className="h-4 w-4" /> Thêm lựa chọn</button>
                </div>
            )}
        </div>
    );
    
    // JSX
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4 pt-16 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-3">
                        <ListBulletIcon className="h-7 w-7" />
                        Chỉnh sửa trường: <span className="text-gray-900">{formInfo.name}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all">
                        <XMarkIcon className="h-7 w-7" />
                    </button>
                </div>

                <div className="flex-grow p-6 overflow-hidden">
                    <div className="flex h-full gap-6">
                        <div className="w-full lg:w-1/3 h-full overflow-y-auto pr-3 custom-scrollbar">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                {isFieldFormInEditMode ? `Chỉnh sửa: ${fieldToEdit?.label}` : 'Thêm trường mới'}
                            </h3>
                            {customFields.length > 0 ? ( customFields.map(renderCustomFieldForm) ) 
                            : (
                                <button type="button" onClick={addCustomField} className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-3 mt-3 rounded-lg w-full font-semibold border-2 border-dashed border-blue-400 transition-all">
                                    <PlusIcon className="h-5 w-5" /> Thêm trường để cấu hình
                                </button>
                            )}

                            {customFields.length > 0 && (
                                <div className="mt-4 flex gap-2">
                                    <button type="button" onClick={handleSaveOrUpdate} className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex-grow disabled:bg-gray-400" disabled={isSaving}>
                                        {isSaving ? 'Đang lưu...' : <><ArrowDownTrayIcon className="h-5 w-5" /> {isFieldFormInEditMode ? 'Cập nhật trường' : 'Lưu trường mới'}</>}
                                    </button>
                                    <button type="button" onClick={() => { setCustomFields([]); setIsFieldFormInEditMode(false); setFieldToEdit(null);}} className="p-2 bg-gray-200 rounded-lg text-gray-600 hover:bg-gray-300"><XMarkIcon className="h-5 w-5"/></button>
                                </div>
                            )}
                        </div>
                        <div className="w-full lg:w-2/3 h-full overflow-y-auto border-l border-gray-200 pl-6 custom-scrollbar">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800">Các trường hiện có</h3>
                            {fieldsData.length > 0 ? (
                                fieldsData.map((item, index) => (
                                    <div key={item.id} className="bg-gray-50 border rounded-lg p-3 flex justify-between items-center mb-2 shadow-sm cursor-grab hover:bg-gray-100">
                                        <div className="flex items-center gap-3">
                                            {dataTypeIcons[item.data_type] || <DocumentTextIcon className="h-5 w-5 text-gray-500" />}
                                            <p className="font-medium text-gray-800">{item.label}</p>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <button onClick={() => handleEditField(item)} className="text-blue-600 hover:scale-125 transition-transform"><PencilSquareIcon className="h-5 w-5" /></button>
                                            <button onClick={() => deleteField(item.id)} className="text-red-600 hover:scale-125 transition-transform"><TrashIcon className="h-5 w-5" /></button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 p-8 mt-10 border-2 border-dashed rounded-lg bg-gray-50">
                                    <p className="font-medium">Chưa có trường nào được tạo.</p>
                                    <p className="text-sm mt-1">Sử dụng panel bên trái để thêm trường mới.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px;}
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #aaa; }
            `}</style>
        </div>
    );
}