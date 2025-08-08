import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../service/BaseUrl';
import {
    CloudArrowUpIcon,
    DocumentArrowUpIcon,
    Cog6ToothIcon,
    LinkIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    WrenchScrewdriverIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';


// --- Reusable Alert Component ---
const Alert = ({ message, type }) => {
    if (!message) return null;

    const baseClasses = "flex items-center p-4 mt-4 text-sm rounded-lg";
    const typeClasses = {
        success: "bg-green-100 text-green-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
    };

    const Icon = {
        success: CheckCircleIcon,
        error: ExclamationCircleIcon,
        info: ArrowPathIcon
    }[type];

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            <Icon className={`h-5 w-5 mr-3 ${type === 'info' ? 'animate-spin' : ''}`} />
            <span className="font-medium">{message}</span>
        </div>
    );
};
const Layout = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // States from original code
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uri, setUri] = useState('');
    const [fields, setFields] = useState([]);
    const [allForm, setAllForm] = useState([]);
    const [selectedForms, setSelectedForms] = useState([]);
    const [secondFile, setSecondFile] = useState(null);
    const [secondMessage, setSecondMessage] = useState('');
    const [pdfObjectUrl, setPdfObjectUrl] = useState('');
    const [pdfFileName, setPdfFileName] = useState('');
    const [urlDownload, setUrlDownload] = useState('');

    // UI state
    const [isLoadingLayout, setIsLoadingLayout] = useState(false);
    const [isLoadingPdf, setIsLoadingPdf] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [detailsRes, allFormsRes, depsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/forms/${id}`),
                    axios.get(`${API_BASE_URL}/forms`),
                    axios.get(`${API_BASE_URL}/forms/${id}/dependencies`)
                ]);

                const result = detailsRes.data;
                if (result.field_form) {
                    const formattedFields = result.field_form.map(item => ({
                        key: item.key,
                        label: item.label,
                        data_type: item.data_type,
                        option: item.options?.join(', ') ?? '',
                    }));
                    setFields(formattedFields);
                }

                setAllForm(allFormsRes.data);
                setSelectedForms((depsRes.data.dependencies || []).map(f => f.id));

            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                Swal.fire('Lỗi', 'Không thể tải dữ liệu ban đầu. ' + (error.response?.data?.detail || error.message), 'error');
            }
        };
        fetchInitialData();
    }, [id]);

    // Cleanup for PDF Object URL
    useEffect(() => {
        return () => {
            if (pdfObjectUrl) {
                URL.revokeObjectURL(pdfObjectUrl);
            }
        };
    }, [pdfObjectUrl]);

    // --- Original Handlers (adapted for new UI) ---
    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleSecondFileChange = (e) => setSecondFile(e.target.files[0]);

    const handleUpload = async () => {
        if (!file) {
            setMessage('Vui lòng chọn file .docx');
            return;
        }
        setIsLoadingLayout(true);
        setMessage('Đang tải lên và tạo layout...');
        const formData = new FormData();
        formData.append('doc_file', file);
        try {
            const response = await axios.post(`${API_BASE_URL}/upload-docx1`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const data = response.data;
            setMessage('✅ ' + data.message);
            setUri(data.filename);
            await updateLayout(data);
        } catch (error) {
            console.error('Lỗi:', error);
            setMessage('❌ ' + (error.response?.data?.detail || error.message));
        } finally {
            setIsLoadingLayout(false);
        }
    };

    const updateLayout = async (data) => {
        try {
            await axios.post(`${API_BASE_URL}/admin/create-layout-form/${id}`, {
                "form_model": data.filename
            });
            const placeholders = data.variables || [];
            const formattedFields = placeholders.map((key) => ({
                key,
                label: '',
                data_type: 'text',
                option: '',
            }));
            setFields(formattedFields);
        } catch (error) {
            console.error('Lỗi khi tạo layout form:', error);
            setMessage(prev => prev + '\n❌ Lỗi khi tạo layout form: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleSecondUpload = async () => {
        if (!secondFile) {
            setSecondMessage('Vui lòng chọn file để upload');
            return;
        }
        setIsLoadingPdf(true);
        setSecondMessage('Đang tải file lên Google Drive...');
        const formData = new FormData();
        formData.append('docx_file', secondFile);
        try {
            const response = await axios.post(`${API_BASE_URL}/google-drive/upload-docx`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const data = response.data;
            setSecondMessage('✅ Upload thành công! Đang chuyển đổi sang PDF...');

            const fileIdMatch = data.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (!fileIdMatch || !fileIdMatch[1]) {
                throw new Error('Không thể trích xuất File ID từ URL Google Drive.');
            }
            const fileId = fileIdMatch[1];

            const pdfResponse = await axios.get(`${API_BASE_URL}/google-drive/export-pdf?fileId=${fileId}`);
            const { pdf_url, file_name } = pdfResponse.data;

            setUrlDownload(pdf_url);
            setPdfFileName(file_name);
            setSecondMessage('✅ Nhận thông tin PDF thành công. Đang tải file xem trước...');

            const blob = await fetch(pdf_url).then(res => {
                if (!res.ok) throw new Error(`Lỗi HTTP! status: ${res.status}`);
                return res.blob();
            });

            const objectUrl = URL.createObjectURL(blob);
            setPdfObjectUrl(objectUrl);
            setSecondMessage('✅ Tải và hiển thị PDF thành công.');

        } catch (error) {
            console.error('Lỗi khi upload file thứ hai:', error);
            setSecondMessage('❌ ' + (error.response?.data?.detail || error.message));
            setPdfObjectUrl('');
        } finally {
            setIsLoadingPdf(false);
        }
    };

    const handleSaveAll = () => {
        Swal.fire({
            title: 'Xác nhận lưu?',
            text: "Toàn bộ cấu hình biểu mẫu và các đơn kèm theo sẽ được lưu lại.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đồng ý lưu',
            cancelButtonText: 'Hủy bỏ'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Start loading spinner in Swal
                    Swal.fire({
                        title: 'Đang lưu...',
                        text: 'Vui lòng chờ trong giây lát.',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    // Promise.all to run saves concurrently
                    await Promise.all([
                        saveDependencyForm(),
                        saveField()
                    ]);

                    Swal.fire('Thành công!', 'Đã lưu cấu hình biểu mẫu thành công.', 'success');
                    navigate('/admin/form-management')
                } catch (error) {
                    console.error('Lỗi khi lưu cấu hình:', error);
                    const errorMessage = error.message || "Đã có lỗi không xác định xảy ra.";
                    Swal.fire('Lỗi!', `Có lỗi xảy ra: ${errorMessage}`, 'error');
                }
            }
        });
    };

    const saveField = async () => {
        try {
            const formattedFields = fields.map((field) => ({
                key: field.key,
                label: field.label,
                data_type: field.data_type,
                options: ['radio', 'select'].includes(field.data_type)
                    ? field.option.split(',').map(opt => opt.trim()).filter(Boolean)
                    : null,
            }));
            const formData = new FormData();
            formData.append('type_of_form_id', id);
            formData.append('fields', JSON.stringify(formattedFields));
            formData.append('url_pdf', urlDownload);
            if (secondFile) {
                formData.append('doc_file', secondFile);
            }
            await axios.post(`${API_BASE_URL}/forms/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        } catch (error) {
            throw new Error('Lỗi khi lưu các trường dữ liệu: ' + (error.response?.data?.detail || error.message));
        }
    };

    const saveDependencyForm = async () => {
        try {
            await axios.post(`${API_BASE_URL}/forms/dependency`, {
                'form_id': id,
                'dependency_form_id': selectedForms,
            });
        } catch (error) {
            throw new Error('Lỗi khi lưu đơn kèm theo: ' + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- LEFT COLUMN --- */}
                <div className="lg:col-span-1 flex flex-col gap-8">
                    {/* Layout Upload Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                            <CloudArrowUpIcon className="h-6 w-6 mr-3 text-blue-500" />
                            1. Tạo Layout Biểu Mẫu
                        </h2>
                        <input
                            type="file"
                            accept=".docx"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        <button
                            onClick={handleUpload}
                            disabled={isLoadingLayout}
                            className="mt-6 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-lg shadow font-semibold transition-all duration-300"
                        >
                            {isLoadingLayout ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : <WrenchScrewdriverIcon className="h-5 w-5 mr-2" />}
                            {isLoadingLayout ? 'Đang tạo...' : 'Tạo Layout'}
                        </button>
                        <Alert message={message.replace(/✅|❌/g, '')} type={message.startsWith('✅') ? 'success' : message.startsWith('❌') ? 'error' : 'info'} />
                    </div>

                    {/* PDF Preview Upload Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                            <DocumentArrowUpIcon className="h-6 w-6 mr-3 text-purple-500" />
                            2. Upload File PDF Xem Trước
                        </h2>
                        <input
                            type="file"
                            accept=".docx"
                            onChange={handleSecondFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                        />
                        <button
                            onClick={handleSecondUpload}
                            disabled={isLoadingPdf}
                            className="mt-6 w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white py-2.5 px-4 rounded-lg shadow font-semibold transition-all duration-300"
                        >
                            {isLoadingPdf ? <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" /> : <DocumentTextIcon className="h-5 w-5 mr-2" />}
                            {isLoadingPdf ? 'Đang xử lý...' : 'Tải lên & Xem trước'}
                        </button>
                        <Alert message={secondMessage.replace(/✅|❌/g, '')} type={secondMessage.startsWith('✅') ? 'success' : secondMessage.startsWith('❌') ? 'error' : 'info'} />
                    </div>

                    {/* Dependency Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                            <LinkIcon className="h-6 w-6 mr-3 text-teal-500" />
                            3. Các Đơn Kèm Theo
                        </h2>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {allForm.filter(f => f.id != id).map((form) => (
                                <label key={form.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedForms.includes(form.id)}
                                        onChange={(e) => {
                                            const newSelected = e.target.checked
                                                ? [...selectedForms, form.id]
                                                : selectedForms.filter(fid => fid !== form.id);
                                            setSelectedForms(newSelected);
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-sm font-medium text-gray-800">{form.name}</span>
                                </label>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-4">Đã chọn {selectedForms.length} biểu mẫu.</p>
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* PDF Preview Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md transition-all hover:shadow-lg min-h-[400px] flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                            <DocumentTextIcon className="h-6 w-6 mr-3 text-green-500" />
                            Xem trước Biểu Mẫu
                        </h2>
                        <div className="flex-grow w-full bg-gray-100 rounded-lg flex items-center justify-center">
                            {isLoadingPdf ? (
                                <div className="text-center text-gray-500">
                                    <ArrowPathIcon className="animate-spin h-12 w-12 mx-auto mb-4" />
                                    <p className="font-semibold">{secondMessage}</p>
                                </div>
                            ) : pdfObjectUrl ? (
                                <iframe
                                    src={pdfObjectUrl}
                                    width="100%"
                                    height="100%"
                                    className="rounded-lg min-h-[600px]"
                                    title={pdfFileName || "PDF Preview"}
                                />
                            ) : (
                                <div className="text-center text-gray-400 p-8">
                                    <DocumentTextIcon className="h-16 w-16 mx-auto mb-4" />
                                    <p className="font-semibold">Bản xem trước PDF sẽ xuất hiện ở đây</p>
                                    <p className="text-sm">Vui lòng upload file từ mục số 2.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fields Configuration Card */}
                    {fields.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-md transition-all hover:shadow-lg">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
                                <Cog6ToothIcon className="h-6 w-6 mr-3 text-orange-500" />
                                4. Thiết lập Trường Dữ Liệu
                            </h2>
                            <div className="space-y-6">
                                {fields.map((field, index) => (
                                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <p className="font-mono text-sm font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-md inline-block mb-4">
                                            Biến: {`{{${field.key}}}`}
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Nhãn hiển thị</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => {
                                                        const newFields = [...fields];
                                                        newFields[index].label = e.target.value;
                                                        setFields(newFields);
                                                    }}
                                                    className="mt-1 block w-full rounded-md border-blue-500 shadow-[0_2px_2px_rgba(0,0,0,0.5)] focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Loại dữ liệu</label>
                                                <select
                                                    value={field.data_type}
                                                    onChange={(e) => {
                                                        const newFields = [...fields];
                                                        newFields[index].data_type = e.target.value;
                                                        setFields(newFields);
                                                    }}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-[0_2px_2px_rgba(0,0,0,0.5)] focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 text-blue-700"
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="number">Number</option>
                                                    <option value="date">Date</option>
                                                    <option value="select">Select</option>
                                                    <option value="radio">Radio</option>
                                                </select>
                                            </div>
                                        </div>
                                        {['select', 'radio'].includes(field.data_type) && (
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700">Tùy chọn (cách nhau bằng dấu phẩy)</label>
                                                <input
                                                    type="text"
                                                    value={field.option}
                                                    onChange={(e) => {
                                                        const newFields = [...fields];
                                                        newFields[index].option = e.target.value;
                                                        setFields(newFields);
                                                    }}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                                                    placeholder="Ví dụ: Tùy chọn 1, Tùy chọn 2"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- SAVE BUTTON --- */}
                <div className="lg:col-span-3 mt-4">
                    <button
                        onClick={handleSaveAll}
                        className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg shadow-lg font-bold text-lg transition-all transform hover:scale-105"
                    >
                        <ArrowDownTrayIcon className="h-6 w-6 mr-3" />
                        Lưu Toàn Bộ Cấu Hình
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Layout;