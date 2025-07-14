import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Định nghĩa các loại trường có thể có
const FIELD_TYPES = {
    TEXT_INPUT: 'text',
    NUMBER_INPUT: 'number',
    TEXTAREA: 'textarea',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    SELECT: 'select',
    FILE_UPLOAD_MULTIPLE: 'file-upload-multiple', // Trường upload nhiều file
    NOTE: 'note',                               // Trường ghi chú
};

const FormLayoutDesigner = () => {
    const { formCode } = useParams(); // Lấy formCode từ URL (ví dụ: don-nghi-hoc)
    const navigate = useNavigate();

    // State để lưu trữ các trường của form
    // Mỗi phần tử trong mảng là một đối tượng mô tả một trường
    const [formFields, setFormFields] = useState([]);
    const [formName, setFormName] = useState(''); // Tên của mẫu đơn đang được thiết kế
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State cho việc thêm trường mới
    const [newFieldType, setNewFieldType] = useState(FIELD_TYPES.TEXT_INPUT);
    const [newFieldLabel, setNewFieldLabel] = useState('');
    const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
    const [newFieldNoteContent, setNewFieldNoteContent] = useState(''); // Nội dung cho ghi chú

    useEffect(() => {
        // Trong thực tế, bạn sẽ fetch thông tin của mẫu đơn dựa trên formCode
        // và tải các trường hiện có của mẫu đơn đó từ backend.
        const fetchFormDetails = async () => {
            setLoading(true);
            try {
                // Giả lập việc fetch tên mẫu đơn và các trường đã lưu (nếu có)
                await new Promise(resolve => setTimeout(resolve, 300));
                
                let fetchedName = `Mẫu đơn: ${formCode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
                let fetchedFields = [];

                // Giả lập việc tải các trường đã có sẵn
                if (formCode === 'don-nghi-hoc') {
                    fetchedFields = [
                        { id: 1, type: FIELD_TYPES.TEXT_INPUT, label: 'Họ và tên', placeholder: 'Nhập họ tên của bạn' },
                        { id: 2, type: FIELD_TYPES.TEXTAREA, label: 'Lý do nghỉ', placeholder: 'Nêu rõ lý do nghỉ' },
                        { id: 3, type: FIELD_TYPES.FILE_UPLOAD_MULTIPLE, label: 'Giấy tờ kèm theo (nếu có)' },
                        { id: 4, type: FIELD_TYPES.NOTE, content: 'Vui lòng nộp đơn trước 3 ngày làm việc.' },
                    ];
                } else if (formCode === 'cap-the-sv') {
                    fetchedFields = [
                        { id: 1, type: FIELD_TYPES.TEXT_INPUT, label: 'Mã số sinh viên', placeholder: 'Nhập mã số sinh viên' },
                        { id: 2, type: FIELD_TYPES.FILE_UPLOAD_MULTIPLE, label: 'Ảnh chân dung, CCCD' },
                        { id: 3, type: FIELD_TYPES.NOTE, content: 'Đảm bảo ảnh rõ nét và đúng quy định.' },
                    ];
                }
                
                setFormName(fetchedName);
                setFormFields(fetchedFields);
                
            } catch (err) {
                console.error("Lỗi khi tải chi tiết mẫu đơn:", err);
                setError("Không thể tải chi tiết mẫu đơn.");
            } finally {
                setLoading(false);
            }
        };

        fetchFormDetails();
    }, [formCode]);

    // Hàm thêm một trường mới vào form
    const addField = () => {
        if (newFieldType === FIELD_TYPES.NOTE && !newFieldNoteContent.trim()) {
            alert('Nội dung ghi chú không được để trống.');
            return;
        }
        if (newFieldType !== FIELD_TYPES.NOTE && !newFieldLabel.trim()) {
            alert('Nhãn trường không được để trống.');
            return;
        }

        const newField = {
            id: formFields.length > 0 ? Math.max(...formFields.map(f => f.id)) + 1 : 1, // ID tăng dần
            type: newFieldType,
            label: newFieldType !== FIELD_TYPES.NOTE ? newFieldLabel : undefined,
            placeholder: newFieldType === FIELD_TYPES.TEXT_INPUT || newFieldType === FIELD_TYPES.TEXTAREA ? newFieldPlaceholder : undefined,
            content: newFieldType === FIELD_TYPES.NOTE ? newFieldNoteContent : undefined,
            // Thêm các thuộc tính khác tùy theo loại trường (ví dụ: options cho select/radio)
        };
        setFormFields([...formFields, newField]);
        setNewFieldType(FIELD_TYPES.TEXT_INPUT); // Reset loại trường
        setNewFieldLabel(''); // Reset nhãn
        setNewFieldPlaceholder(''); // Reset placeholder
        setNewFieldNoteContent(''); // Reset nội dung ghi chú
    };

    // Hàm xóa một trường
    const removeField = (id) => {
        setFormFields(formFields.filter(field => field.id !== id));
    };

    // Hàm lưu cấu hình layout (gửi lên backend)
    const saveLayout = async () => {
        // Trong thực tế, bạn sẽ gửi formFields lên backend cùng với formCode
        // Ví dụ: await fetch(`/api/forms/${formCode}/layout`, { method: 'POST', body: JSON.stringify(formFields) });
        console.log("Saving layout for", formName, ":", formFields);
        alert('Cấu hình layout đã được lưu (mô phỏng)!');
        navigate('/admin/form-management'); // Quay lại trang quản lý sau khi lưu
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                <p className="ml-4 text-gray-700 text-lg">Đang tải cấu hình mẫu đơn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-red-100 text-red-700 p-4">
                <p className="text-xl font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6 border-b pb-4">
                    Thiết kế Layout: {formName}
                </h1>

                {/* Phần thêm trường mới */}
                <div className="bg-blue-50 p-6 rounded-lg shadow-inner mb-8">
                    <h3 className="text-2xl font-bold text-blue-800 mb-4">Thêm trường mới</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label htmlFor="fieldType" className="block text-sm font-medium text-gray-700 mb-1">Loại trường</label>
                            <select
                                id="fieldType"
                                value={newFieldType}
                                onChange={(e) => setNewFieldType(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                                <option value={FIELD_TYPES.TEXT_INPUT}>Input (Văn bản)</option>
                                <option value={FIELD_TYPES.NUMBER_INPUT}>Input (Số)</option>
                                <option value={FIELD_TYPES.TEXTAREA}>Textarea (Nhiều dòng)</option>
                                <option value={FIELD_TYPES.CHECKBOX}>Checkbox</option>
                                <option value={FIELD_TYPES.RADIO}>Radio Button</option>
                                <option value={FIELD_TYPES.SELECT}>Dropdown (Select)</option>
                                <option value={FIELD_TYPES.FILE_UPLOAD_MULTIPLE}>Upload nhiều File</option>
                                <option value={FIELD_TYPES.NOTE}>Ghi chú</option>
                            </select>
                        </div>
                        {newFieldType !== FIELD_TYPES.NOTE && (
                            <div>
                                <label htmlFor="fieldLabel" className="block text-sm font-medium text-gray-700 mb-1">Nhãn trường</label>
                                <input
                                    type="text"
                                    id="fieldLabel"
                                    value={newFieldLabel}
                                    onChange={(e) => setNewFieldLabel(e.target.value)}
                                    placeholder="Nhập nhãn cho trường này"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        )}
                        {(newFieldType === FIELD_TYPES.TEXT_INPUT || newFieldType === FIELD_TYPES.TEXTAREA) && (
                            <div>
                                <label htmlFor="fieldPlaceholder" className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                                <input
                                    type="text"
                                    id="fieldPlaceholder"
                                    value={newFieldPlaceholder}
                                    onChange={(e) => setNewFieldPlaceholder(e.target.value)}
                                    placeholder="Nhập placeholder"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        )}
                        {newFieldType === FIELD_TYPES.NOTE && (
                            <div className="col-span-full"> {/* Ghi chú có thể chiếm hết chiều rộng */}
                                <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-1">Nội dung ghi chú</label>
                                <textarea
                                    id="noteContent"
                                    value={newFieldNoteContent}
                                    onChange={(e) => setNewFieldNoteContent(e.target.value)}
                                    rows="3"
                                    placeholder="Nhập nội dung ghi chú hoặc hướng dẫn"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                ></textarea>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={addField}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Thêm trường
                    </button>
                </div>

                {/* Danh sách các trường hiện có trong form */}
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Các trường hiện có trong Mẫu đơn:</h3>
                {formFields.length === 0 ? (
                    <p className="text-gray-500 text-lg mb-8">Chưa có trường nào được thêm vào mẫu đơn này.</p>
                ) : (
                    <div className="space-y-4 mb-8">
                        {formFields.map((field, index) => (
                            <div key={field.id} className="bg-gray-100 p-4 rounded-lg shadow-sm flex justify-between items-center border border-gray-200">
                                <div className="flex-grow">
                                    <p className="text-lg font-semibold text-gray-800">
                                        {index + 1}. {field.label || `Ghi chú (${field.type})`}{" "}
                                        <span className="text-sm font-normal text-gray-500">({field.type === FIELD_TYPES.FILE_UPLOAD_MULTIPLE ? 'Tải nhiều file' : field.type === FIELD_TYPES.NOTE ? 'Ghi chú' : field.type})</span>
                                    </p>
                                    {field.placeholder && (
                                        <p className="text-sm text-gray-600">Placeholder: "{field.placeholder}"</p>
                                    )}
                                    {field.content && field.type === FIELD_TYPES.NOTE && (
                                        <p className="text-sm text-gray-700 italic">"{field.content}"</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeField(field.id)}
                                    className="ml-4 p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                    aria-label={`Xóa trường ${field.label || field.type}`}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Nút lưu */}
                <div className="flex justify-end pt-4 border-t">
                    <button
                        onClick={saveLayout}
                        className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        <svg className="-ml-1 mr-3 h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Lưu Cấu hình Layout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FormLayoutDesigner;