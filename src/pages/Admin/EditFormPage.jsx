import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; // Make sure Swal is available (e.g., linked in index.html or installed)
import {
    PencilSquareIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon,
    DocumentArrowUpIcon, TrashIcon, PlusCircleIcon, PencilIcon,
    ChevronUpIcon, ChevronDownIcon,
} from '@heroicons/react/24/outline'; // Icons for better UI feedback
import {
    ArrowPathIcon,
} from '@heroicons/react/24/solid';

import { API_BASE_URL } from '../../service/BaseUrl';

const Layout = () => {
    const { id: formId } = useParams(); // Rename id to formId for consistency
    const navigate = useNavigate(); // Keep navigate if needed for redirection

    // Merged state from Layout and EditFormPage
    const [formData, setFormData] = useState({
        name: '',
        form_model: '', // Corresponds to Layout's 'uri'
        field_form: [], // Corresponds to Layout's 'fields'
    });
    const [newFormFile, setNewFormFile] = useState(null); // New file chosen for upload
    const [isLoading, setIsLoading] = useState(true); // For initial form load
    const [isSaving, setIsSaving] = useState(false); // For upload/save actions
    const [error, setError] = useState(null); // For general errors
    const [uploadMessage, setUploadMessage] = useState(''); // Specific message for DOCX upload

    // Original Layout states for dependencies
    const [allForm, setAllForm] = useState([]);
    const [selectedForms, setSelectedForms] = useState([]);

    // docxHtml is kept but will remain empty as its fetch was removed
    const [docxHtml, setDocxHtml] = useState('');

    const fileInputRef = useRef(null); // Ref for file input, if needed for clearing

    // --- Effect to load form data using fetchForm logic ---
    useEffect(() => {
        const fetchForm = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await axios.get(`${API_BASE_URL}/forms/${formId}`);
                setFormData({
                    name: response.data.name || '',
                    form_model: response.data.form_model || '',
                    field_form: response.data.field_form || [],
                });
                // Update uri if it's still used in other parts of the Layout component
                // setUri(response.data.form_model || ''); // No longer strictly needed if formData.form_model is the source of truth
            } catch (err) {
                console.error('Lỗi khi tải biểu mẫu:', err);
                setError('Không thể tải dữ liệu biểu mẫu. Vui lòng thử lại.');
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể tải dữ liệu biểu mẫu. Vui lòng kiểm tra lại ID hoặc kết nối.',
                    confirmButtonText: 'Đã hiểu',
                    customClass: { confirmButton: 'swal-button-custom-error', },
                    buttonsStyling: false,
                });
                // navigate('/forms'); // Layout component doesn't have a direct navigation target defined in its original context.
            } finally {
                setIsLoading(false);
            }
        };

        if (formId) {
            fetchForm();
        }
    }, [formId]); // Depend on formId

    // --- Effect to fetch dependencies (original Layout logic) ---
    useEffect(() => {
        async function fetchDependencies() {
            try {
                const res = await axios.get(`${API_BASE_URL}/forms/${formId}/dependencies`); // Use formId
                const data = res.data;
                console.log("dependency_form_ids", data.dependency_form_ids);
                setSelectedForms(data.dependency_form_ids || []);
            } catch (error) {
                console.error("Lỗi khi tải các biểu mẫu phụ thuộc:", error);
            }
        }
        fetchDependencies();
    }, [formId]); // Depend on formId

    // --- Effect to get all forms (original Layout logic) ---
    useEffect(() => {
        async function getAllForm() {
            try {
                const response = await axios.get(`${API_BASE_URL}/forms`);
                const data = response.data;
                console.log("data1", data);
                setAllForm(data);
            } catch (error) {
                console.error("Lỗi khi tải tất cả biểu mẫu:", error);
            }
        }
        getAllForm();
    }, []); // No dependencies, runs once

    // --- Handlers from EditFormPage, adapted for Layout's context ---

    const handleNameChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            name: e.target.value,
        }));
    };

    const handleNewFileChange = (e) => { // Renamed from handleFileChange in Layout to match EditFormPage
        const file = e.target.files[0];
        if (file) {
            if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.type === "application/msword") {
                setNewFormFile(file);
                setUploadMessage(''); // Clear previous upload message
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'File không hợp lệ!',
                    text: 'Vui lòng chỉ chọn file Word (.docx hoặc .doc).',
                    confirmButtonText: 'Đã hiểu',
                    customClass: { confirmButton: 'swal-button-custom-error' },
                    buttonsStyling: false,
                });
                e.target.value = null; // Clear input
                setNewFormFile(null);
            }
        } else {
            setNewFormFile(null);
            setUploadMessage('');
        }
    };

    const handleFieldChange = (index, fieldName, value) => {
        setFormData((prevData) => {
            const updatedFields = [...prevData.field_form];
            updatedFields[index] = {
                ...updatedFields[index],
                [fieldName]: value,
            };
            return { ...prevData, field_form: updatedFields };
        });
    };

    const handleAddField = () => {
        setFormData((prevData) => ({
            ...prevData,
            field_form: [
                ...prevData.field_form,
                {
                    id: `new-${Date.now()}`, // Temporary ID for new field
                    key: '',
                    data_type: 'text', // Default to text
                    label: '',
                    options: null, // Use options for consistency
                    order: prevData.field_form.length + 1,
                },
            ],
        }));
    };

    const handleRemoveField = (indexToRemove) => {
        Swal.fire({
            title: 'Bạn có chắc?',
            text: "Bạn sẽ không thể hoàn tác thao tác này!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa nó!',
            cancelButtonText: 'Hủy',
            customClass: {
                confirmButton: 'swal-button-custom-confirm',
                cancelButton: 'swal-button-custom-cancel',
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                setFormData((prevData) => {
                    const updatedFields = prevData.field_form.filter((_, index) => index !== indexToRemove);
                    // Re-order after removal
                    const reorderedFields = updatedFields.map((field, idx) => ({
                        ...field,
                        order: idx + 1,
                    }));
                    return { ...prevData, field_form: reorderedFields };
                });
                Swal.fire('Đã xóa!', 'Trường đã được xóa.', 'success');
            }
        });
    };

    const handleMoveField = (index, direction) => {
        setFormData((prevData) => {
            const fields = [...prevData.field_form];
            const newIndex = index + direction;

            if (newIndex >= 0 && newIndex < fields.length) {
                const [movedField] = fields.splice(index, 1);
                fields.splice(newIndex, 0, movedField);

                // Update order
                const reorderedFields = fields.map((field, idx) => ({
                    ...field,
                    order: idx + 1,
                }));
                return { ...prevData, field_form: reorderedFields };
            }
            return prevData;
        });
    };

    // --- Adapted handleUpload from original Layout, now updates formData ---
    const handleUpload = async () => {
        if (!newFormFile) return setUploadMessage('Vui lòng chọn file .docx'); // Use newFormFile and setUploadMessage
        const formDataUpload = new FormData();
        formDataUpload.append('doc_file', newFormFile);

        setUploadMessage('Đang tải lên file Word mẫu...');
        setIsSaving(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/upload-docx1`, formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = response.data;
            setUploadMessage('✅ Tải lên file Word mẫu thành công!');

            // Update formData state with the new form_model and fields
            setFormData(prev => ({
                ...prev,
                form_model: data.filename, // Update form_model
                field_form: data.variables ? data.variables.map(key => ({
                    id: `new-${Date.now()}-${key}`, // Unique ID for new fields from upload
                    key,
                    label: '',
                    data_type: 'text',
                    options: null,
                    order: prev.field_form.length + 1, // Assign order for new fields
                })) : [],
            }));
            // setUri(data.filename); // No longer strictly needed if formData.form_model is the source of truth

        } catch (error) {
            console.error('Lỗi khi tải lên DOCX:', error);
            const uploadErrorMessage = error.response?.data?.detail || 'Lỗi khi tải lên file DOCX. Vui lòng thử lại.';
            setUploadMessage('❌ ' + uploadErrorMessage);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi tải lên file!',
                text: uploadErrorMessage,
                confirmButtonText: 'Đã hiểu',
                customClass: { confirmButton: 'swal-button-custom-error' },
                buttonsStyling: false,
            });
        } finally {
            setIsSaving(false);
        }
    };

    // --- Adapted saveField from original Layout, now uses formData ---
    const saveField = async () => {
        setIsSaving(true);
        try {
            const formattedFields = formData.field_form.map((field) => {
                const isMultiOption = ['radio', 'checkbox', 'select'].includes(field.data_type);
                return {
                    key: field.key,
                    label: field.label,
                    data_type: field.data_type,
                    options: isMultiOption
                        ? (field.options || '').split(',').map(opt => opt.trim()).filter(opt => opt !== '')
                        : null,
                    order: field.order, // Include order
                };
            });

            // This endpoint seems to be for saving fields specifically, not the whole form.
            // If the backend expects a full form update (name, form_model, fields),
            // this needs to be changed to match the handleSubmit in EditFormPage.
            // For now, assuming it's a partial update for fields.
            const response = await axios.post(`${API_BASE_URL}/forms/${formId}`, {
                name: formData.name, // Also send name
                form_model: formData.form_model, // Also send form_model
                field_form: formattedFields, // Send the formatted fields
            });

            Swal.fire({
                title: 'Thành công',
                text: 'Lưu biểu mẫu thành công',
                icon: 'success',
            });
            // No need to clear fields after saving, as we are editing existing data.
            // setFields([]); // Removed
            // console.log("uri", uri); // uri is now formData.form_model
            // console.log("fields", fields); // fields is now formData.field_form
            // console.log("docxHtml", docxHtml); // docxHtml is not populated

        } catch (error) {
            console.error('Lỗi khi lưu form:', error);
            Swal.fire({
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi lưu biểu mẫu: ' + (error.response?.data?.detail || error.message),
                icon: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // --- Original saveDependencyForm logic ---
    const saveDependencyForm = async () => {
        setIsSaving(true); // Indicate saving state
        try {
            const response = await axios.post(`${API_BASE_URL}/forms/dependency`, {
                'form_id': formId, // Use formId
                'dependency_form_id': selectedForms,
            });
            console.log(response.data);

            Swal.fire({
                title: 'Thành công',
                text: 'Lưu biểu mẫu kèm theo thành công',
                icon: 'success',
            });
        } catch (error) {
            console.error('Lỗi khi lưu form:', error);
            Swal.fire({
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi lưu biểu mẫu kèm theo: ' + (error.response?.data?.detail || error.message),
                icon: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    }

    // --- Loading and Error UI from EditFormPage ---
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
                <div className="flex flex-col items-center text-gray-600">
                    <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-500 mb-4" />
                    <p className="text-xl font-semibold">Đang tải biểu mẫu...</p>
                </div>
            </div>
        );
    }

    if (error && !isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
                <div className="flex flex-col items-center text-red-600 bg-red-50 border border-red-200 p-8 rounded-lg shadow-md">
                    <XCircleIcon className="h-16 w-16 mb-4" />
                    <p className="text-xl font-semibold mb-2">Đã xảy ra lỗi!</p>
                    <p className="text-center">{error}</p>
                    <button
                        onClick={() => navigate('/forms')} // Assuming '/forms' is a valid route
                        className="mt-6 bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition duration-200"
                    >
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-100 h-screen pb-10 ">
            {/* Left Panel - Upload */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📄 Upload file .docx</h2>

                {/* Form Name Input - Added from EditFormPage */}
                <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
                        Tên biểu mẫu:
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleNameChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                        required
                        disabled={isSaving}
                    />
                </div>

                {/* File Upload Input */}
                <input
                    type="file"
                    accept=".docx,.doc" // Accept both docx and doc
                    onChange={handleNewFileChange} // Use handleNewFileChange
                    className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 transition"
                    disabled={isSaving}
                />
                {/* Display current file / selected new file */}
                {newFormFile ? (
                    <p className="mt-2 text-sm text-indigo-600 font-medium">
                        Đã chọn: {newFormFile.name}
                    </p>
                ) : (
                    <p className="mt-2 text-sm text-gray-500">
                        File hiện tại: {formData.form_model || "Chưa có file"}
                    </p>
                )}


                <button
                    onClick={handleUpload}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving || !newFormFile} // Disable if saving or no new file selected
                >
                    {isSaving && uploadMessage.includes('tải lên file Word mẫu') ? (
                        <>
                            <ArrowPathIcon className="animate-spin h-5 w-5 inline-block mr-2" />
                            <span>Đang tải lên...</span>
                        </>
                    ) : (
                        <>
                            📤 Tải lên và tạo layout
                        </>
                    )}
                </button>

                {uploadMessage && ( // Use uploadMessage for file upload status
                    <p className={`mt-4 text-sm text-gray-800 bg-gray-100 p-3 rounded border ${uploadMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                        {uploadMessage}
                    </p>
                )}

                <p className="mt-4 text-base font-semibold text-start text-gray-800 p-3 ">
                    Các đơn kèm theo khi nộp biểu mẫu
                </p>
                <div className='mt-2'>
                    {allForm.map((form, index) => (
                        form.id != formId && ( // Use formId
                            <div key={index} className='bg-white p-4 rounded-xl '>
                                <label className='flex items-center'>
                                    <input
                                        type="checkbox"
                                        className="mr-2 w-4 h-4"
                                        checked={selectedForms.includes(form.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedForms([...selectedForms, form.id]);
                                            } else {
                                                setSelectedForms(selectedForms.filter(fid => fid !== form.id));
                                            }
                                        }}
                                        disabled={isSaving}
                                    />
                                    {form.name}
                                </label>

                            </div>
                        )
                    ))}
                    <p className='text-sm text-gray-600 mt-2'>
                        Đã chọn {selectedForms.length} biểu mẫu phụ thuộc
                    </p>
                    <button
                        onClick={saveDependencyForm}
                        className='mt-4 bg-blue-600 hover:bg-blue-700 w-full text-white py-2 px-4 rounded-lg shadow font-medium transition disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={isSaving}
                    >
                        {isSaving && uploadMessage.includes('Lưu biểu mẫu kèm theo') ? ( // Simple check for saving dependency
                            <>
                                <ArrowPathIcon className="animate-spin h-5 w-5 inline-block mr-2" />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <span>Lưu</span>
                        )}
                    </button>
                </div>

            </div>

            {/* Right Panel - Fields */}
            <div className="w-full md:w-2/3 h-full overflow-y-auto">
                {formData.field_form.length > 0 && <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 Thiết lập Trường Dữ Liệu</h2>}
                <div className="space-y-6">
                    {/* This div was for docxHtml, but docxHtml is not being populated now */}
                    {/* {docxHtml != undefined && formData.field_form.length === 0 &&
                        <div className='w-full h-full bg-white py-4 px-8 rounded-lg shadow-md overflow-hidden'>
                            <div className='form_model' dangerouslySetInnerHTML={{ __html: docxHtml }} />
                        </div>} */}

                    {formData.field_form.length === 0 && !isLoading && (
                        <p className="text-gray-500 text-center py-4">Chưa có trường dữ liệu nào. Hãy thêm mới hoặc tải lên file Word mẫu!</p>
                    )}

                    {formData.field_form.map((field, index) => (
                        <div key={field.id || `field-${index}`} className="bg-white p-4 rounded-xl shadow border">

                            <p className="font-semibold text-blue-700 mb-2">
                                Biến: <code>{`{${field.key}}`}</code>
                            </p>
                            <div className='flex gap-4'>
                                <div className='w-1/2'>
                                    <label className="block text-start text-sm font-medium text-gray-600">Nhãn hiển thị (Label)</label>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                                        className="mt-1 w-full border p-2 rounded-md focus:ring focus:ring-blue-200"
                                        disabled={isSaving}
                                    />
                                </div>
                                <div className='w-1/2'>
                                    <label className="block text-start text-sm font-medium text-gray-600">Loại dữ liệu</label>
                                    <select
                                        value={field.data_type}
                                        onChange={(e) => handleFieldChange(index, 'data_type', e.target.value)}
                                        className="mt-1 w-full border p-2 rounded-md focus:ring focus:ring-blue-200"
                                        disabled={isSaving}
                                    >
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="date">Date</option>
                                        <option value="textarea">Textarea</option>
                                        <option value="checkbox">Checkbox</option>
                                        <option value="radio">Radio</option>
                                        <option value="select">Select</option>
                                    </select>
                                </div>
                            </div>
                            {(field.data_type === 'select' || field.data_type === 'radio' || field.data_type === 'checkbox') && (
                                <div className='mt-3 w-full'>
                                    <label className="block mt-3 text-sm font-medium text-gray-600">
                                        Tuỳ chọn (cách nhau bằng dấu phẩy)
                                    </label>
                                    <input
                                        name='options' // Use 'options' for consistency
                                        type="text"
                                        value={field.options || ''} // Use field.options
                                        onChange={(e) => handleFieldChange(index, 'options', e.target.value)}
                                        className="w-full mt-1 block !max-w-[unset] border p-2 rounded-md focus:ring focus:ring-blue-200"
                                        placeholder="option1, option2, option3"
                                        disabled={isSaving}
                                    />
                                </div>
                            )}
                            <div className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4 md:mt-0 md:ml-4">
                                <button
                                    type="button"
                                    onClick={() => handleMoveField(index, -1)}
                                    disabled={index === 0 || isSaving}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-indigo-600 disabled:opacity-50 transition-colors"
                                    title="Di chuyển lên"
                                >
                                    <ChevronUpIcon className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMoveField(index, 1)}
                                    disabled={index === formData.field_form.length - 1 || isSaving}
                                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-indigo-600 disabled:opacity-50 transition-colors"
                                    title="Di chuyển xuống"
                                >
                                    <ChevronDownIcon className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveField(index)}
                                    disabled={isSaving}
                                    className="p-2 rounded-full text-red-500 hover:bg-red-100 disabled:opacity-50 transition-colors"
                                    title="Xóa trường này"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleAddField}
                    disabled={isSaving}
                    className="mt-6 flex items-center space-x-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PlusCircleIcon className="h-5 w-5" />
                    <span>Thêm trường mới</span>
                </button>

                {formData.field_form.length > 0 && (
                    <button
                        onClick={saveField}
                        className="mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSaving}
                    >
                        {isSaving && !uploadMessage.includes('tải lên file Word mẫu') ? ( // Check if saving fields, not file upload
                            <>
                                <ArrowPathIcon className="animate-spin h-5 w-5 inline-block mr-2" />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                💾 Lưu biểu mẫu
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Layout;
