import React, { useState, useEffect } from 'react';

const CreateFieldForm = () => {
    const [typeOfForm, setTypeOfForm] = useState([]);
    const [selectedForm, setSelectedForm] = useState(null);
    const [customFields, setCustomFields] = useState([]);
    const [draggedItem, setDraggedItem] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [FieldEdit, setFieldEdit] = useState(null);

    const [fieldFormList, setFieldFormList] = useState([]);
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    useEffect(() => {
        const fetchTypeOfForm = async () => {
            try {
                const response = await fetch('http://nckh.local/api/forms');
                const data = await response.json();
                setTypeOfForm(data);
            } catch (error) {
                console.error('Error fetching type of form:', error);
            }
        };

        fetchTypeOfForm();
    }, []);

    useEffect(() => {
        if (selectedForm?.field_form) {
            setFieldFormList([...selectedForm.field_form]);
        }
    }, [selectedForm]);

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

    const updateFieldForm = async (field) => {

        try {
            const res = await fetch(`http://nckh.local/api/forms/${selectedForm.id}/fields/${field.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customFields[0])
            })

            if (!res.ok) throw new Error('Lỗi khi lấy danh sách trường');
            setCustomFields([]);
            fetchFieldList();
            Swal.fire({
                text: "Cập nhật thành công",
                icon: "success"
            });

        } catch (error) {
            Swal.fire({
                text: "Cập nhật thất bại",
                icon: "error"
            });
        }
    };


    const handleEditField = (field) => {
        setIsEdit(true)
        setFieldEdit(field)
        setCustomFields(() => [
            { data_type: `${field.data_type}`, label: `${field.label}`, options: field.options },
        ]);


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
        if (selectedForm) {
            if (isEdit) {
                setCustomFields(() => [
                    { data_type: 'text', label: '', options: [] },
                ]);
            } else {
                setCustomFields((prevFields) => [
                    ...prevFields,
                    { data_type: 'text', label: '', options: [] },
                ]);
            }
        } else {
            Swal.fire({
                text: "Vui lòng chọn loại đơn học vụ trước khi thêm trường",
                icon: "warning"
            });
        }
    };

    const storeCustomField = async (event) => {
        try {
            const response = await fetch(`http://nckh.local/api/forms/${selectedForm.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type_of_form_id: selectedForm?.id,
                    fields: customFields
                }),
            });


            if (!response.ok) {
                Swal.fire({
                    text: "Lưu thất bại",
                    icon: "error"
                });
                throw new Error('Lưu thất bại');
            }
            await response.json();
            fetchFieldList();
            setCustomFields([]);
            if (customFields.length > 0) {
                Swal.fire({
                    text: "Tạo trường thành công",
                    icon: "success"
                });
            } else {
                Swal.fire({
                    text: "Vui lòng thêm trường",
                    icon: "error"
                });
            }
        } catch (error) {
            Swal.fire({
                text: "Vui lòng chọn loại đơn học vụ",
                icon: "error"
            });
        }
    };

    const updateFieldOrder = async (updatedFields) => {
        console.log("1" + updatedFields.length);
        const updatedOrder = updatedFields.map((field, index) => ({
            id: field.id || index,
            position: index + 1,
        }));
        console.log(updatedOrder);

        try {
            const response = await fetch(`http://nckh.local/api/forms/${selectedForm.id}/fields/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
        // if (!window.confirm('Bạn có chắc muốn xoá trường này?')) return;
        Swal.fire({
            title: 'Bạn có chắc muốn xoá trường này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Xoá',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`http://nckh.local/api/forms/${selectedForm.id}/fields/${fieldId}`, {
                        method: 'DELETE',
                    });
        
                    if (!response.ok) {
                        Swal.fire({
                            text: "Xoá thất bại",
                            icon: "error"
                        });
                        throw new Error('Xoá thất bại');
                    } else {
                        Swal.fire({
                            text: "Xoá thành công",
                            icon: "success"
                        });
                    }
                    await response.json();
                    fetchFieldList();
                } catch (error) {
                    console.error('Lỗi khi xoá:', error);
                    Swal.fire({
                        text: "Có lỗi khi xoá trường.",
                        icon: "error"
                    });
                }
               
            }
        });
        
    };

    const removeCustomField = (index) => {
        setCustomFields((prevFields) => prevFields.filter((_, i) => i !== index));
    };

    const handleCustomFieldChange = (index, field, value) => {
        const updatedFields = [...customFields];
        updatedFields[index][field] = value;
        setCustomFields(updatedFields);
    };

    const handleDragStart = (index) => {
        setDraggedItemIndex(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Cho phép thả
    };

    const handleDrop = (index) => {
        const updatedList = [...fieldFormList];
        const draggedItem = updatedList.splice(draggedItemIndex, 1)[0];
        updatedList.splice(index, 0, draggedItem);
        setFieldFormList(updatedList);
        setDraggedItemIndex(null);
        updateFieldOrder(updatedList);
    };

    return (
        <div className="bg-gray-100 ">
            <div className="flex flex-col min-h-[500px] mx-3 mt-6 lg:flex-row">
                <div className="w-full lg:w-1/3 rounded-lg bg-white p-5 m-1">
                    <h2 className="text-xl font-semibold mb-4">Tạo Đơn Học Vụ</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (isEdit) {
                            updateFieldForm(FieldEdit);
                        } else {
                            storeCustomField(e);
                        }
                    }}>
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
                            {Array.isArray(customFields) && customFields.length > 0 &&
                                customFields.map((field, index) => (
                                    field && ( // ✅ chỉ render nếu field không undefined
                                        <div key={index} className="mt-2 p-3 bg-gray-50 rounded-lg">
                                            <label className="block text-gray-700">Kiểu dữ liệu:</label>
                                            <select
                                                onChange={(e) => handleCustomFieldChange(index, 'data_type', e.target.value)}
                                                value={field.data_type || ''}
                                                className="border rounded-md p-2 w-full mt-1"
                                            >
                                                <option value="text">Text</option>
                                                <option value="email">Email</option>
                                                <option value="number">Number</option>
                                                <option value="date">Date</option>
                                                <option value="textarea">Textarea</option>
                                                <option value="checkbox">Checkbox</option>
                                                <option value="radio">Radio</option>
                                            </select>

                                            <label className="block text-gray-700 mt-2">Tên trường:</label>
                                            <input
                                                type="text"
                                                value={field.label || ''}
                                                onChange={(e) => handleCustomFieldChange(index, 'label', e.target.value)}
                                                className="border rounded-md p-2 w-full mt-1"
                                                placeholder="Nhập giá trị"
                                            />

                                            {/* phần checkbox/radio */}
                                            {['checkbox', 'radio'].includes(field.data_type) && (
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
                                    )
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

                            {isEdit ? " Lưu " : "Tạo"}

                        </button>
                    </form>
                </div>

                <div className="w-full lg:w-2/3 m-1 bg-white shadow-lg text-lg rounded-lg border border-gray-200">
                    <h1 className="text-center text-2xl uppercase font-bold py-2">{selectedForm?.name}</h1>
                    <div id="field_list">
                        {fieldFormList.map((field, index) => (
                            <div
                                key={field.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                className="field_item bg-gray-200 shadow-xl m-3 p-4 cursor-move flex justify-between items-center"
                            >
                                <p>{field.label}</p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleEditField(field)}
                                        className="hover:bg-transparent hover:scale-125 transition-all duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="blue" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="text-red-500 hover:bg-transparent hover:scale-125 transition-all duration-300"
                                     onClick={() => deleteField(field.id)}>
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

export default CreateFieldForm;