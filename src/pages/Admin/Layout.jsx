import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../service/BaseUrl';
const Layout = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uri, setUri] = useState('');
    const { id } = useParams();
    const [fields, setFields] = useState([]);
    const [allForm, setAllForm] = useState([]);
    const [selectedForms, setSelectedForms] = useState([]);

    const [secondFile, setSecondFile] = useState(null);
    const [secondMessage, setSecondMessage] = useState('');
    // State để lưu Object URL của PDF
    const [pdfObjectUrl, setPdfObjectUrl] = useState('');
    // Các state này có thể không cần thiết nữa nếu bạn dùng Object URL,
    // nhưng giữ lại để backend vẫn trả về và bạn có thể debug
    const [initialPdfUrl, setInitialPdfUrl] = useState(''); // URL ban đầu từ server
    const [accessToken, setAccessToken] = useState('');
    const [pdfFileName, setPdfFileName] = useState('');
    const [urlDownload,setUrlDownload]=useState('');

    useEffect(() => {
        async function fetchDependencies() {
            try {
                const res = await axios.get(`${API_BASE_URL}/forms/${id}/dependencies`);
                const data = res.data;
                console.log("dependency_form_ids", data.dependencies);

                setSelectedForms((data.dependencies || []).map(f => f.id));
            } catch (error) {
                console.error("Lỗi khi tải các biểu mẫu phụ thuộc:", error);
            }
        }

        fetchDependencies();
    }, []);

    useEffect(() => {
        async function getFormDetail() {
            try {
                const response = await axios.get(`${API_BASE_URL}/forms/${id}`);
                const result = response.data;
                if (result.field_form) {
                    const formattedFields = result.field_form.map((item) => ({
                        key: item.key,
                        label: item.label,
                        data_type: item.data_type,
                        option: item.options ?? '',
                    }));
                    setFields(formattedFields);
                }
                console.log(result['form_model']);
                console.log(result);
            } catch (error) {
                console.error("Failed to fetch forms:", error);
            }
        }

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
        getFormDetail();
    }, [id]);

    // Cleanup function for Object URL
    useEffect(() => {
        return () => {
            if (pdfObjectUrl) {
                URL.revokeObjectURL(pdfObjectUrl);
                console.log("Revoked PDF Object URL:", pdfObjectUrl);
            }
        };
    }, [pdfObjectUrl]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSecondFileChange = (e) => {
        setSecondFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Vui lòng chọn file .docx');
            return;
        }
        const formData = new FormData();
        formData.append('doc_file', file);

        console.log("uri", uri);
        try {
            const response = await axios.post(`${API_BASE_URL}/upload-docx1`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = response.data;
            setMessage('✅ ' + data.message);
            console.log("Filename", data.filename);
            setUri(data.filename);
            updateLayout(data);

        } catch (error) {
            console.error('Lỗi:', error);
            setMessage('❌ ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleSecondUpload = async () => {
        if (!secondFile) {
            setSecondMessage('Vui lòng chọn file để upload');
            setPdfObjectUrl('');
            setInitialPdfUrl('');
            setAccessToken('');
            setPdfFileName('');
            return;
        }
        const formData = new FormData();
        formData.append('docx_file', secondFile);

        try {
            const response = await axios.post(`${API_BASE_URL}/google-drive/upload-docx`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const data = response.data;
            setSecondMessage('✅ ' + data.message);
            console.log("Uploaded file URL (Google Drive):", data.url);

            const url = data.url;
            const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (fileIdMatch && fileIdMatch[1]) {
                const fileId = fileIdMatch[1];
                console.log("Extracted File ID:", fileId);

                try {
                    const pdfResponse = await axios.get(`${API_BASE_URL}/google-drive/export-pdf?fileId=${fileId}`);
                    const { pdf_url, file_name } = pdfResponse.data;
                    console.log(pdfResponse.data);
                    console.log(pdfResponse.data.pdf_url);
                    
                    setInitialPdfUrl(pdf_url); // Lưu URL ban đầu từ server
                    // setAccessToken(access_token); // Dòng này đã được comment out
                    setPdfFileName(file_name);
                    setUrlDownload(pdfResponse.data.pdf_url); // Cập nhật urlDownload với pdf_url
                    console.log("url download",urlDownload);
                    
                    setSecondMessage('✅ Nhận thông tin PDF thành công. Đang tải file...');

                    // --- Sử dụng fetch để tải file PDF mà không cần access token ---
                    fetch(pdf_url) // Đã loại bỏ fetchOptions
                        .then(res => {
                            if (!res.ok) {
                                // Xử lý lỗi HTTP (ví dụ: 401 Unauthorized, 404 Not Found)
                                throw new Error(`HTTP error! status: ${res.status}`);
                            }
                            return res.blob();
                        })
                        .then(blob => {
                            const objectUrl = URL.createObjectURL(blob);
                            setPdfObjectUrl(objectUrl); // Lưu Object URL vào state
                            setSecondMessage('✅ Tải và hiển thị PDF thành công.');
                        })
                        .catch(fetchError => {
                            console.error('Lỗi khi tải file PDF bằng fetch:', fetchError);
                            setSecondMessage('❌ Lỗi khi tải hoặc hiển thị PDF: ' + fetchError.message);
                            setPdfObjectUrl('');
                        });
                    // --- Kết thúc fetch ---

                } catch (pdfApiError) {
                    console.error('Lỗi khi lấy URL/token PDF từ file:', pdfApiError);
                    setSecondMessage('❌ Lỗi khi lấy thông tin PDF: ' + (pdfApiError.response?.data?.detail || pdfApiError.message));
                    setPdfObjectUrl('');
                    setInitialPdfUrl('');
                    setAccessToken('');
                    setPdfFileName('');
                }

            } else {
                setSecondMessage('❌ Không thể trích xuất File ID từ URL Google Drive: ' + url);
                setPdfObjectUrl('');
                setInitialPdfUrl('');
                setAccessToken('');
                setPdfFileName('');
            }

        } catch (error) {
            console.error('Lỗi khi upload file thứ hai:', error);
            setSecondMessage('❌ ' + (error.response?.data?.detail || error.message));
            setPdfObjectUrl('');
            setInitialPdfUrl('');
            setAccessToken('');
            setPdfFileName('');
        }
    };

    const updateLayout = async (data) => {
        try {
            const res2 = await axios.post(`${API_BASE_URL}/admin/create-layout-form/${id}`, {
                "form_model": data.filename
            });

            const result = res2.data;
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
            throw new Error('Lỗi khi tạo layout form: ' + (error.response?.data?.detail || error.message));
        }
    };

    const saveField = async () => {
        try {
            const formattedFields = fields.map((field) => {
                const isMultiOption = ['radio', 'checkbox'].includes(field.data_type);
                return {
                    key: field.key,
                    label: field.label,
                    data_type: field.data_type,
                    options: isMultiOption
                        ? field.option.split(',').map(opt => opt.trim()).filter(opt => opt !== '')
                        : null,
                };
            });

            const formData = new FormData();
            formData.append('type_of_form_id', id);
            formData.append('fields', JSON.stringify(formattedFields)); // Stringify fields array
            formData.append('url_pdf', urlDownload); // Already present

            // Append secondFile if it exists
            if (secondFile) {
                formData.append('doc_file', secondFile); // Use a new key like 'pdf_file' for the actual file
            }

            const response = await axios.post(`${API_BASE_URL}/forms/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Important for FormData
                }
            });

            await response.data;
            Swal.fire({
                title: 'Thành công',
                text: 'Lưu biểu mẫu thành công',
                icon: 'success',
            });
            console.log("uri", uri);
            // setFields([]); // Consider if you want to clear fields after saving

        } catch (error) {
            console.error('Lỗi khi lưu form:', error);
            Swal.fire({
                title: 'Lỗi',
                text: 'Có lỗi xảy ra khi lưu biểu mẫu: ' + (error.response?.data?.detail || error.message),
                icon: 'error',
            });
        }
    };

    const saveDependencyForm = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/forms/dependency`, {
                'form_id': id,
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
        }
    }


    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-100 h-screen pb-10 ">
            {/* Left Panel - Upload */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-xl overflow-y-auto shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📄 Upload file tạo biểu mẫu định dạng .docx</h2>

                <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 transition"
                />

                <button
                    onClick={handleUpload}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg shadow font-medium transition"
                >
                    📤 Tải lên và tạo layout
                </button>

                {message && (
                    <p className="mt-4 text-sm text-gray-800 bg-gray-100 p-3 rounded border">
                        {message}
                    </p>
                )}

                {/* --- New File Upload Section --- */}
                <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">⬆️ Upload File hiển thị xem trước PDF</h2>

                <input
                    type="file"
                    onChange={handleSecondFileChange}
                    className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-50 file:text-purple-700
                    hover:file:bg-purple-100 transition"
                />

                <button
                    onClick={handleSecondUpload}
                    className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg shadow font-medium transition"
                >
                    ⬆️ Tải lên và Xem trước PDF
                </button>

                {secondMessage && (
                    <p className="mt-4 text-sm text-gray-800 bg-gray-100 p-3 rounded border">
                        {secondMessage}
                    </p>
                )}
                {/* --- End New File Upload Section --- */}

                <p className="mt-4 text-base font-semibold text-start text-gray-800 p-3 ">
                    Các đơn kèm theo khi nộp biểu mẫu
                </p>
                <div className='mt-2'>
                    {allForm.map((form, index) => (
                        form.id != id && (
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
                                    />
                                    {form.name}
                                </label>

                            </div>
                        )
                    ))}
                    <p className='text-sm text-gray-600 mt-2'>
                        Đã chọn {selectedForms.length} biểu mẫu phụ thuộc
                    </p>
                    <button onClick={saveDependencyForm} className='mt-4 bg-blue-600 hover:bg-blue-700 w-full text-white py-2 px-4 rounded-lg shadow font-medium transition'>
                        Lưu
                    </button>
                </div>

            </div>

            {/* Right Panel - Fields and PDF Preview */}
            <div className="w-full md:w-2/3 h-full overflow-y-auto">
                {/* PDF Preview Section */}
                {pdfObjectUrl ? ( // Sử dụng pdfObjectUrl để điều kiện hiển thị
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Xem trước File PDF</h2>
                        {pdfFileName && <p className="text-sm text-gray-600 mb-2">Tên file: {pdfFileName}</p>}
                        <div className='w-full bg-white p-4 rounded-xl shadow-md' style={{ minHeight: '600px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <iframe
                                src={pdfObjectUrl} // Sử dụng Object URL ở đây
                                width="100%"
                                height="600px"
                                style={{ border: 'none' }}
                                title="PDF Preview"
                            >
                                Trình duyệt của bạn không hỗ trợ hiển thị PDF.
                                Bạn có thể <a href={pdfObjectUrl} target="_blank" rel="noopener noreferrer">tải xuống PDF tại đây</a>.
                            </iframe>
                        </div>
                    </>
                ) : (
                    secondMessage && initialPdfUrl && !pdfObjectUrl && (
                           <div className="w-full bg-white p-4 rounded-xl shadow-md text-center text-gray-600">
                               <p>Đang tải PDF... Vui lòng chờ.</p>
                           </div>
                    )
                )}

                {/* Add vertical spacing between PDF and Fields if both are present */}
                {pdfObjectUrl && fields.length > 0 && <div className="my-8 border-t border-gray-200"></div>}

                {/* Fields Setup Section */}
                {fields.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 Thiết lập Trường Dữ Liệu</h2>
                        <div className="space-y-6">
                            {fields.map((field, index) => (
                                <div key={index} className="bg-white p-4 rounded-xl shadow border">
                                    <p className="font-semibold text-blue-700 mb-2">
                                        Biến: <code>{`{${field.key}}`}</code>
                                    </p>
                                    <div className='flex gap-4'>
                                        <div className='w-1/2'>
                                            <label className="block text-start text-sm font-medium text-gray-600">Nhãn hiển thị (Label)</label>
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={(e) => {
                                                    const newFields = [...fields];
                                                    newFields[index].label = e.target.value;
                                                    setFields(newFields);
                                                }}
                                                className="mt-1 w-full border p-2 rounded-md focus:ring focus:ring-blue-200"
                                            />
                                        </div>
                                        <div className='w-1/2'>
                                            <label className="block text-start text-sm font-medium text-gray-600">Loại dữ liệu</label>
                                            <select
                                                value={field.data_type}
                                                onChange={(e) => {
                                                    const newFields = [...fields];
                                                    newFields[index].data_type = e.target.value;
                                                    setFields(newFields);
                                                }}
                                                className="mt-1 w-full border p-2 rounded-md focus:ring focus:ring-blue-200"
                                            >
                                                <option value="text">Text</option>
                                                <option value="number">Number</option>
                                                <option value="date">Date</option>
                                                <option value="select">Select</option>
                                                <option value="radio">Radio</option>
                                            </select>
                                        </div>
                                    </div>
                                    {(field.data_type === 'select' || field.data_type === 'radio') && (
                                        <div className='mt-3 w-full'>
                                            <label className="block mt-3 text-sm font-medium text-gray-600">
                                                Tuỳ chọn (cách nhau bằng dấu phẩy)
                                            </label>
                                            <input
                                                name='option'
                                                type="text"
                                                value={field.option}
                                                onChange={(e) => {
                                                    const newFields = [...fields];
                                                    newFields[index].option = e.target.value;
                                                    setFields(newFields);
                                                }}
                                                className="w-full mt-1 block !max-w-[unset] border p-2 rounded-md focus:ring focus:ring-blue-200"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={saveField}
                            className="mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
                        >
                            💾 Lưu biểu mẫu
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Layout;
