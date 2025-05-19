import React, { useState, useEffect } from 'react';

const FormCustom = () => {
    const [typeOfForm, setTypeOfForm] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [customFields, setCustomFields] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);

    useEffect(() => {
        const fetchTypeOfForm = async () => {
            try {
                const response = await fetch('http://nckh.local/api/type-of-forms');
                const data = await response.json();
                setTypeOfForm(data);
            } catch (error) {
                console.error('Error fetching type of form:', error);
            }
        };

        fetchTypeOfForm();
    }, []);

    const fetchFieldList = async () => {
        try {
            const res = await fetch(`http://nckh.local/api/forms/${selectedForm.id}`);
            if (!res.ok) throw new Error('Lỗi khi lấy danh sách trường');
            const data = await res.json();
            setSelectedForm(data);
        } catch (error) {
            console.error('Lỗi khi cập nhật giao diện:', error);
        }
    };

    const handleTypeFormChange = async (event) => {
        const typeId = event.target.value;
        if (typeId) {
            try {
                const response = await fetch(`http://nckh.local/api/forms/${typeId}`);
                const data = await response.json();
                setSelectedForm(data);
            } catch (error) {
                console.error('Error fetching selected form:', error);
            }
        } else {
            setSelectedForm(null);
        }
    };

    const addCustomField = () => {
        setCustomFields((prevFields) => [
            ...prevFields,
            { key: 'text', label: '', options: [] },
        ]);
    };

    const storeCustomField = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://nckh.local/api/forms/${selectedForm.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type_of_form_id: selectedForm?.id,
                    fields: customFields,
                }),
            });

            if (!response.ok) throw new Error('Lưu thất bại');
            await response.json();
            fetchFieldList();
            setCustomFields([]);
        } catch (error) {
            console.error('Lỗi khi lưu form:', error);
            alert('Có lỗi xảy ra khi lưu biểu mẫu.');
        }
    };

    const updateFieldOrder = async () => {
        const updatedOrder = customFields.map((field, index) => ({
            id: field.id || index,
            position: index + 1,
        }));

        try {
            const response = await fetch('/api/field/update-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({ order: updatedOrder }),
            });

            if (!response.ok) throw new Error('Failed to update order');
            await response.json();
        } catch (error) {
            console.error('Error updating field order:', error);
        }
    };

    const deleteField = async (fieldId) => {
        if (!window.confirm('Bạn có chắc muốn xoá trường này?')) return;
        try {
            const response = await fetch(`http://nckh.local/api/forms/${selectedForm.id}/fields/${fieldId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Xoá thất bại');
            await response.json();
            alert('Xoá thành công');
            fetchFieldList();
        } catch (error) {
            console.error('Lỗi khi xoá:', error);
            alert('Có lỗi khi xoá trường.');
        }
    };

    const removeCustomField = (index) => {
        setCustomFields((prevFields) => prevFields.filter((_, i) => i !== index));
    };

    const handleCustomFieldChange = (index, field, value) => {
        const updatedFields = [...customFields];
        updatedFields[index][field] = value;
        setCustomFields(updatedFields);
    };

    const handleDragStart = (event, index) => {
        setDraggedItem(index);
    };

    const handleDrop = (event, index) => {
        event.preventDefault();
        const newFields = [...customFields];
        const draggedField = newFields[draggedItem];
        newFields.splice(draggedItem, 1);
        newFields.splice(index, 0, draggedField);
        setCustomFields(newFields);
        setDraggedItem(null);
        updateFieldOrder();
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div className="bg-gray-100">
            <div className="flex flex-col mx-3 mt-6 lg:flex-row">
                <div className="w-full lg:w-1/3 rounded-lg bg-white p-5 m-1">
                    <h2 className="text-xl font-semibold mb-4">Tạo Đơn Học Vụ</h2>
                    <form onSubmit={storeCustomField}>
                        <label className="block text-gray-700">Loại đơn:</label>
                        <select
                            onChange={handleTypeFormChange}
                            value={selectedForm?.id || ''}
                            className="border rounded-md p-2 w-full mt-1"
                        >
                            <option value="">Chọn loại đơn</option>
                            {typeOfForm.map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>

                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-700">Thông tin bổ sung:</h3>
                            {customFields.map((field, index) => (
                                <div key={index} className="mt-2 p-3 bg-gray-50 rounded-lg">
                                    <label className="block text-gray-700">Kiểu dữ liệu:</label>
                                    <select
                                        onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                                        value={field.key}
                                        className="border rounded-md p-2 w-full mt-1"
                                    >
                                        <option value="text">Text</option>
                                        <option value="email">Email</option>
                                        <option value="number">Number</option>
                                        <option value="textarea">Textarea</option>
                                        <option value="checkbox">Checkbox</option>
                                        <option value="radio">Radio</option>
                                    </select>

                                    <label className="block text-gray-700 mt-2">Tên trường:</label>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)}
                                        className="border rounded-md p-2 w-full mt-1"
                                        placeholder="Nhập giá trị"
                                    />

                                    {['checkbox', 'radio'].includes(field.key) && (
                                        <div className="mt-2">
                                            <label className="block text-gray-700">Tùy chọn (Options):</label>
                                            {(field.options || []).map((option, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-2 mt-1">
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const updatedOptions = [...field.options];
                                                            updatedOptions[optIndex] = e.target.value;
                                                            handleCustomFieldChange(index, 'options', updatedOptions);
                                                        }}
                                                        className="border rounded-md p-2 w-full"
                                                        placeholder="Nhập lựa chọn"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updatedOptions = [...field.options];
                                                            updatedOptions.splice(optIndex, 1);
                                                            handleCustomFieldChange(index, 'options', updatedOptions);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 font-bold"
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedOptions = [...(field.options || []), ''];
                                                    handleCustomFieldChange(index, 'options', updatedOptions);
                                                }}
                                                className="mt-2 text-blue-600 hover:underline"
                                            >
                                                + Thêm lựa chọn
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => removeCustomField(index)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 mt-3 rounded"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={addCustomField}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-4 rounded-lg w-full"
                        >
                            + Thêm Trường
                        </button>

                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 mt-4 rounded-lg w-full"
                        >
                            Lưu Đơn
                        </button>
                    </form>
                </div>

                <div className="w-full lg:w-2/3 m-1 bg-white shadow-lg text-lg rounded-lg border border-gray-200">
                    <h1 className="text-center text-2xl uppercase font-bold py-2">{selectedForm?.name}</h1>
                    <div id="field_list">
                        {selectedForm?.field_form?.map((item, index) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragOver={handleDragOver}
                                className="field_item bg-gray-200 shadow-xl m-3 p-4 flex justify-between items-center"
                            >
                                <p>{item.label}</p>
                                <div className="flex gap-3">
                                    <button onClick={() => alert('Sửa chưa triển khai')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293z" />
                                            <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                        </svg>
                                    </button>
                                    <button onClick={() => deleteField(item.id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5M6 1.5v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.03l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06M10.53 4.5a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.06l.5-8.5a.5.5 0 0 0-.47-.53M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormCustom;