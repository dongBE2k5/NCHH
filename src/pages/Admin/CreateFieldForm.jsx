import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../service/BaseUrl';
import {
    PlusIcon, // For Plus
    ArrowDownTrayIcon, // Replaced SaveIcon with ArrowDownTrayIcon for Heroicons v2 compatibility
    PencilSquareIcon, // For Edit
    TrashIcon, // For Trash2
    ListBulletIcon, // For ListOrdered
    DocumentTextIcon, // For Type (Text)
    EnvelopeIcon, // For Mail (Email)
    HashtagIcon, // For Hash (Number)
    Bars3BottomLeftIcon, // For Textarea
    CheckIcon, // For checkbox representation
    // RadioGroupIcon is not directly available in Heroicons solid, using custom SVG below
} from '@heroicons/react/24/solid'; // Importing icons from @heroicons/react/24/solid

// Custom SweetAlert2 styles
const swalCustomClass = {
    popup: 'rounded-lg shadow-xl',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200',
    cancelButton: 'bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200',
    title: 'text-blue-700 text-2xl font-bold',
    htmlContainer: 'text-gray-700 text-base',
};

export default function CreateFieldForm() {
    const [typeOfForm, setTypeOfForm] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [customFields, setCustomFields] = useState([]);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [fieldToEdit, setFieldToEdit] = useState(null);
    const [isLoadingForms, setIsLoadingForms] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Map data types to Heroicons for better visual representation
    const dataTypeIcons = {
        text: <DocumentTextIcon className="h-5 w-5 text-blue-500" />,
        email: <EnvelopeIcon className="h-5 w-5 text-green-500" />,
        number: <HashtagIcon className="h-5 w-5 text-purple-500" />,
        textarea: <Bars3BottomLeftIcon className="h-5 w-5 text-orange-500" />,
        checkbox: <CheckIcon className="h-5 w-5 text-teal-500" />, // Using CheckIcon for checkbox representation
        radio: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-red-500">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v3.75a.75.75 0 0 0 1.5 0V9Z" clipRule="evenodd" />
            </svg>
        ), // Custom SVG for radio as Heroicons doesn't have a direct RadioGroupIcon like Lucide
    };

    // Fetch all form types on component mount
    useEffect(() => {
        const fetchTypeOfForm = async () => {
            setIsLoadingForms(true);
            try {
                const response = await fetch(`${API_BASE_URL}/forms`);
                if (!response.ok) throw new Error('Failed to fetch form types');
                const data = await response.json();
                setTypeOfForm(data);
            } catch (error) {
                console.error('Error fetching type of form:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể tải danh sách loại đơn. Vui lòng thử lại.',
                    customClass: swalCustomClass,
                });
            } finally {
                setIsLoadingForms(false);
            }
        };

        fetchTypeOfForm();
    }, []);

    // Fetch fields for the selected form
    const fetchFieldList = useCallback(async (formId) => {
        if (!formId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/forms/${formId}`);
            if (!res.ok) throw new Error('Lỗi khi lấy danh sách trường');
            const data = await res.json();
            setSelectedForm(data);
        } catch (error) {
            console.error('Lỗi khi cập nhật giao diện:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể tải danh sách trường cho biểu mẫu này.',
                customClass: swalCustomClass,
            });
        }
    }, []);

    // Effect to fetch fields when selectedForm changes
    useEffect(() => {
        if (selectedForm?.id) {
            fetchFieldList(selectedForm.id);
        }
    }, [selectedForm?.id, fetchFieldList]);

    // Update an existing field
    const updateFieldForm = useCallback(async () => {
        if (!fieldToEdit || !selectedForm?.id || customFields.length === 0) return;

        setIsSaving(true);
        try {
            const fieldData = { ...customFields[0] }; // Get the first (and only) item in customFields for editing
            // Ensure options are an array, even if empty or null
            fieldData.options = Array.isArray(fieldData.options) ? fieldData.options : [];

            const res = await fetch(`${API_BASE_URL}/forms/${selectedForm.id}/fields/${fieldToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fieldData)
            });

            if (!res.ok) throw new Error('Cập nhật trường thất bại');

            await Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Trường đã được cập nhật.',
                customClass: swalCustomClass,
            });
            setCustomFields([]); // Clear custom fields after successful update
            setIsEditMode(false);
            setFieldToEdit(null);
            fetchFieldList(selectedForm.id); // Refresh the list
        } catch (error) {
            console.error('Lỗi khi cập nhật trường:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: `Không thể cập nhật trường: ${error.message}`,
                customClass: swalCustomClass,
            });
        } finally {
            setIsSaving(false);
        }
    }, [customFields, fieldToEdit, selectedForm?.id, fetchFieldList]);

    // Handle editing a field: populate the form with its data
    const handleEditField = useCallback((field) => {
        setIsEditMode(true);
        setFieldToEdit(field);
        setCustomFields([
            { data_type: field.data_type, label: field.label, options: Array.isArray(field.options) ? field.options : [] },
        ]);
    }, []);

    // Handle change in form type selection
    const handleTypeFormChange = useCallback(async (event) => {
        const typeId = event.target.value;
        setSelectedForm(null); // Clear selected form and fields when changing type
        setCustomFields([]); // Clear any custom fields being added/edited
        setIsEditMode(false);
        setFieldToEdit(null);
        if (typeId) {
            try {
                const response = await fetch(`${API_BASE_URL}/forms/${typeId}`);
                if (!response.ok) throw new Error('Failed to fetch selected form');
                const data = await response.json();
                setSelectedForm(data);
            } catch (error) {
                console.error('Error fetching selected form:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể tải thông tin biểu mẫu đã chọn.',
                    customClass: swalCustomClass,
                });
            }
        }
    }, []);

    // Add a new custom field to the temporary list
    const addCustomField = useCallback(() => {
        if (isEditMode) {
            // If in edit mode, clear edit mode and add a new field
            setIsEditMode(false);
            setFieldToEdit(null);
        }
        setCustomFields((prevFields) => [
            ...prevFields,
            { data_type: 'text', label: '', options: [] },
        ]);
    }, [isEditMode]);

    // Store new custom fields
    const storeCustomField = useCallback(async () => {
        if (!selectedForm?.id || customFields.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Thiếu thông tin!',
                text: 'Vui lòng chọn loại đơn và thêm ít nhất một trường.',
                customClass: swalCustomClass,
            });
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/forms/${selectedForm.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type_of_form_id: selectedForm.id,
                    fields: customFields.map(field => ({
                        ...field,
                        options: Array.isArray(field.options) ? field.options : [] // Ensure options is an array
                    }))
                }),
            });

            if (!response.ok) throw new Error('Lưu thất bại');

            await Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Trường đã được lưu.',
                customClass: swalCustomClass,
            });
            setCustomFields([]); // Clear custom fields after successful save
            fetchFieldList(selectedForm.id); // Refresh the list
        } catch (error) {
            console.error('Lỗi khi lưu form:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: `Có lỗi xảy ra khi lưu biểu mẫu: ${error.message}`,
                customClass: swalCustomClass,
            });
        } finally {
            setIsSaving(false);
        }
    }, [selectedForm?.id, customFields, fetchFieldList]);

    // Update field order (drag and drop)
    const updateFieldOrder = useCallback(async (newFields) => {
        const updatedOrder = newFields.map((field, index) => ({
            id: field.id, // Assuming 'id' exists for existing fields
            position: index + 1,
        }));

        try {
            const response = await fetch(`${API_BASE_URL}/field/update-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ order: updatedOrder }),
            });

            if (!response.ok) throw new Error('Failed to update order');
        } catch (error) {
            console.error('Error updating field order:', error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Không thể cập nhật thứ tự trường.',
                customClass: swalCustomClass,
            });
        }
    }, []);

    // Delete a field
    const deleteField = useCallback(async (fieldId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Bạn sẽ không thể hoàn tác thao tác này!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có, xóa nó!',
            cancelButtonText: 'Không, hủy bỏ!',
            customClass: swalCustomClass,
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_BASE_URL}/forms/${selectedForm.id}/fields/${fieldId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) throw new Error('Xóa thất bại');

                await Swal.fire({
                    icon: 'success',
                    title: 'Đã xóa!',
                    text: 'Trường đã được xóa thành công.',
                    customClass: swalCustomClass,
                });
                fetchFieldList(selectedForm.id); // Refresh the list
            } catch (error) {
                console.error('Lỗi khi xóa:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: `Có lỗi khi xóa trường: ${error.message}`,
                    customClass: swalCustomClass,
                });
            }
        }
    }, [selectedForm?.id, fetchFieldList]);

    // Remove a temporary custom field from the list
    const removeCustomField = useCallback((index) => {
        setCustomFields((prevFields) => prevFields.filter((_, i) => i !== index));
        if (isEditMode && index === 0) { // If the only field being edited is removed
            setIsEditMode(false);
            setFieldToEdit(null);
        }
    }, [isEditMode]);

    // Handle changes in custom field properties (data_type, label, options)
    const handleCustomFieldChange = useCallback((index, fieldKey, value) => {
        setCustomFields(prevFields => {
            const updatedFields = [...prevFields];
            updatedFields[index] = { ...updatedFields[index], [fieldKey]: value };
            return updatedFields;
        });
    }, []);

    // Drag and drop handlers
    const handleDragStart = useCallback((event, index) => {
        setDraggedItemIndex(index);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', index); // Set data for drag operation
    }, []);

    const handleDrop = useCallback((event, dropIndex) => {
        event.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === dropIndex) return;

        const newFields = [...(selectedForm?.field_form || [])];
        const [draggedField] = newFields.splice(draggedItemIndex, 1);
        newFields.splice(dropIndex, 0, draggedField);

        setSelectedForm(prev => ({ ...prev, field_form: newFields }));
        setDraggedItemIndex(null);
        updateFieldOrder(newFields); // Update order on backend
    }, [draggedItemIndex, selectedForm?.field_form, updateFieldOrder]);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // Render function for a single custom field form
    const renderCustomFieldForm = (field, index) => (
        <div key={index} className="mt-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-800 text-md">
                    {isEditMode ? `Chỉnh sửa trường: ${fieldToEdit?.label}` : `Trường mới ${index + 1}`}
                </h4>
                <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                    title="Xóa trường này"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <label className="block text-gray-700 text-sm font-medium mb-1">Kiểu dữ liệu:</label>
            <select
                onChange={(e) => handleCustomFieldChange(index, 'data_type', e.target.value)}
                value={field.data_type}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
            >
                <option value="text">Text (Văn bản)</option>
                <option value="email">Email</option>
                <option value="number">Number (Số)</option>
                <option value="textarea">Textarea (Văn bản dài)</option>
                <option value="checkbox">Checkbox (Hộp kiểm)</option>
                <option value="radio">Radio (Chọn một)</option>
            </select>

            <label className="block text-gray-700 text-sm font-medium mt-3 mb-1">Tên trường (Label):</label>
            <input
                type="text"
                value={field.label}
                onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
                placeholder="Ví dụ: Họ và tên, Ngày sinh..."
            />

            {['checkbox', 'radio'].includes(field.data_type) && (
                <div className="mt-3 p-3 bg-gray-100 rounded-md border border-gray-200">
                    <label className="block text-gray-700 text-sm font-medium mb-2">Tùy chọn (Options):</label>
                    {(field.options || []).map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2 mt-1">
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                    const updatedOptions = [...(field.options || [])];
                                    updatedOptions[optIndex] = e.target.value;
                                    handleCustomFieldChange(index, 'options', updatedOptions);
                                }}
                                className="border border-gray-300 rounded-lg px-3 py-2 w-full text-sm"
                                placeholder={`Lựa chọn ${optIndex + 1}`}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const updatedOptions = [...(field.options || [])];
                                    updatedOptions.splice(optIndex, 1);
                                    handleCustomFieldChange(index, 'options', updatedOptions);
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                title="Xóa lựa chọn này"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            const updatedOptions = [...(field.options || []), ''];
                            handleCustomFieldChange(index, 'options', updatedOptions);
                        }}
                        className="mt-3 text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                        <PlusIcon className="h-4 w-4" /> Thêm lựa chọn
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-inter">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
                {/* Left Panel: Form Creation/Editing */}
                <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                        <ListBulletIcon className="h-7 w-7" /> Quản lý Trường Biểu Mẫu
                    </h2>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (isEditMode) {
                            updateFieldForm();
                        } else {
                            storeCustomField();
                        }
                    }}>
                        <div className="mb-4">
                            <label htmlFor="formType" className="block text-gray-700 text-sm font-medium mb-2">Chọn loại đơn:</label>
                            {isLoadingForms ? (
                                <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
                            ) : (
                                <select
                                    id="formType"
                                    onChange={handleTypeFormChange}
                                    value={selectedForm?.id || ''}
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-base"
                                >
                                    <option value="">-- Chọn loại đơn --</option>
                                    {typeOfForm.map((item) => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {selectedForm && (
                            <div className="mt-6 border-t border-gray-200 pt-6">


                                {customFields.map((field, index) => renderCustomFieldForm(field, index))}

                                {isEditMode && (
                                    <button
                                        type="submit"
                                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 mt-3 rounded-lg w-full font-semibold shadow-md transition-colors duration-200"
                                        disabled={isSaving || customFields.length === 0}
                                    >
                                        {isSaving ? (
                                            <>
                                                <svg
                                                    className="animate-spin h-5 w-5 text-white"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                5.291A7.962 7.962 0 014 12H0c0 
                3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDownTrayIcon className="h-5 w-5" />
                                                <span>Lưu thay đổi</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                {isEditMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditMode(false);
                                            setFieldToEdit(null);
                                            setCustomFields([]);
                                        }}
                                        className="text-red-600 hover:text-red-800 hover:bg-transparent text-sm mt-3 w-full text-center underline"
                                    >
                                        Hủy chỉnh sửa
                                    </button>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                {/* Right Panel: Form Preview/Field List */}
                <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    <h1 className="text-2xl font-bold text-blue-700 mb-6 text-center">
                        {selectedForm ? `Xem trước biểu mẫu: ${selectedForm.name}` : "Chọn loại đơn để xem trước"}
                    </h1>

                    {!selectedForm ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ListBulletIcon className="h-24 w-24 mb-4" />
                            <p className="text-lg">Vui lòng chọn một loại đơn từ danh sách bên trái.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
                            {selectedForm?.field_form?.length === 0 ? (
                                <div className="text-center text-gray-500 p-8 border border-dashed border-gray-300 rounded-lg">
                                    <p className="mb-2">Chưa có trường nào được tạo cho biểu mẫu này.</p>
                                    <p>Sử dụng panel bên trái để thêm các trường mới.</p>
                                </div>
                            ) : (
                                selectedForm.field_form.map((item, index) => (
                                    <div
                                        key={item.id || `new-field-${index}`} // Use item.id if available, fallback to index
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDrop={(e) => handleDrop(e, index)}
                                        onDragOver={handleDragOver}
                                        className={`
                                            field_item bg-gray-100 border border-gray-200 rounded-lg p-4
                                            flex justify-between items-center shadow-sm cursor-grab
                                            hover:shadow-md transition-all duration-200 ease-in-out
                                            ${draggedItemIndex === index ? 'opacity-50 border-blue-500 bg-blue-50' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            {dataTypeIcons[item.data_type] || <DocumentTextIcon className="h-5 w-5 text-gray-500" />}
                                            <p className="font-medium text-gray-800">{item.label || "Chưa đặt tên"}</p>
                                            {item.options && item.options.length > 0 && (
                                                <span className="text-gray-500 text-sm ml-2">
                                                    ({item.options.join(', ')})
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            <button
                                                type="button"
                                                onClick={() => handleEditField(item)}
                                                className="text-blue-600 hover:scale-125 hover:bg-transparent duration-500"
                                                title="Sửa trường"
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteField(item.id)}
                                                className="text-red-600 hover:scale-125 hover:bg-transparent duration-500"
                                                title="Xóa trường"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Custom scrollbar style */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    );
}
