import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer"; // Nếu cần hiển thị file

const Layout = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uri, setUri] = useState('');
    const { id } = useParams();
    const [fields, setFields] = useState([]);
    const [docxHtml, setDocxHtml] = useState('');
    const [allForm, setAllForm] = useState([]);
    const [selectedForms, setSelectedForms] = useState([]);


    useEffect(() => {
        async function fetchDependencies() {
            const res = await fetch(`http://localhost:8000/api/forms/${id}/dependencies`);
            const data = await res.json();
            console.log("dependency_form_ids", data.dependency_form_ids);

            setSelectedForms(data.dependency_form_ids || []);
        }

        fetchDependencies();
    }, [id]);


    useEffect(() => {
        async function getFormDetail() {
            try {
                const response = await fetch(`http://localhost:8000/api/forms/${id}`);
                if (!response.ok) throw new Error('Lỗi tải dữ liệu');
                const result = await response.json();
                console.log(result['form_model']);
                try {
                    const res = await fetch(`http://localhost:8000/api/docx-to-html/${result['form_model']}`);
                    const data = await res.json();
                    console.log("data", data);
                    setDocxHtml(data.html);
                } catch (err) {
                    console.error("Lỗi khi đọc đơn:", err);
                }

            } catch (error) {
                console.error("Failed to fetch forms:", error);
            }
        }

        async function getAllForm() {
            const response = await fetch(`http://localhost:8000/api/forms`);
            const data = await response.json();
            console.log("data1", data);
            setAllForm(data);
        }
        getAllForm();
        getFormDetail();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return setMessage('Vui lòng chọn file .docx');
        const formData = new FormData();
        formData.append('doc_file', file);

        console.log("uri", uri);
        try {
            const response = await fetch('http://localhost:8000/api/upload-docx1', {
                method: 'POST',
                body: formData,
            });

            const contentType = response.headers.get('content-type');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Lỗi khi upload DOCX: ' + errorText);
            }

            const data = contentType.includes('application/json')
                ? await response.json()
                : { message: 'Upload thành công nhưng không có JSON' };

            setMessage('✅ ' + data.message);
            console.log("Filename", data.filename);
            setUri(data.filename);
            updateLayout(data);

        } catch (error) {
            console.error('Lỗi:', error);
            setMessage('❌ ' + error.message);
        }
    };

    const updateLayout = async (data) => {
        const res2 = await fetch(`http://localhost:8000/api/admin/create-layout-form/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "form_model": data.filename }),
        });

        if (!res2.ok) {
            const errText = await res2.text();
            throw new Error('Lỗi khi tạo layout form: ' + errText);
        }

        const result = await res2.json();
        const placeholders = data.variables || [];
        const formattedFields = placeholders.map((key) => ({
            key,
            label: '',
            data_type: 'text',
            option: '',
        }));
        setFields(formattedFields);
    };

    const saveField = async () => {
        try {
            // Xử lý lại dữ liệu cho phù hợp backend
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

            const response = await fetch(`http://localhost:8000/api/forms/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type_of_form_id: id,
                    fields: formattedFields,
                }),
            });

            if (!response.ok) throw new Error('Lưu thất bại');
            await response.json();
            Swal.fire({
                title: 'Thành công',
                text: 'Lưu biểu mẫu thành công',
                icon: 'success',
            });
            fetchDocxHtml(uri);
            console.log("uri", uri);
            setFields([]);
            console.log("fields", fields);
            console.log("docxHtml", docxHtml);

        } catch (error) {
            console.error('Lỗi khi lưu form:', error);
            alert('❌ Có lỗi xảy ra khi lưu biểu mẫu.');
        }
    };
    // const fetchDocxHtml = async (filename) => {
    //     try {
    //         const res = await fetch(`http://localhost:8000/api/docx-to-html/${filename}`);
    //         const data = await res.json();
    //         setDocxHtml(data.html);
    //     } catch (err) {
    //         console.error("Lỗi khi load lại layout HTML:", err);
    //     }
    // };

    const saveDependencyForm = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/forms/dependency`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'form_id': id,
                    'dependency_form_id': selectedForms,
                }),
            });
            console.log(response);
            
            if (!response.ok) throw new Error('Lưu thất bại');
            await response.json();
            Swal.fire({
                title: 'Thành công',
                text: 'Lưu biểu mẫu kèm theo thành công',
                icon: 'success',
            });
        } catch (error) {
            console.error('Lỗi khi lưu form:', error);
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-100 h-screen pb-10 ">
            {/* Left Panel - Upload */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📄 Upload file .docx</h2>

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

            {/* Right Panel - Fields */}
            <div className="w-full md:w-2/3 h-full overflow-y-auto">
                {fields.length > 0 && <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 Thiết lập Trường Dữ Liệu</h2>}
                <div className="space-y-6">
                    {docxHtml != undefined && fields.length === 0 &&
                        <div className='w-full h-full bg-white py-4 px-8 rounded-lg shadow-md overflow-hidden'>
                            {/* <div className='form_model' dangerouslySetInnerHTML={{ __html: docxHtml }} /> */}
                        </div>}

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

                {fields.length > 0 && (
                    <button
                        onClick={saveField}
                        className="mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
                    >
                        💾 Lưu biểu mẫu
                    </button>
                )}
            </div>
        </div>
    );
};

export default Layout;
