// src/components/admin/FormLayoutManager.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // << 1. IMPORT useNavigate
import Swal from 'sweetalert2';
import FormTreeItem from './FormTreeItem';
import FolderService from '../../service/FolderService';
import FormTemplateService from '../../service/FormTemplateService';
import FieldEditorModal from './FieldEditorModal';

const buildTree = (folders, forms) => { /* ... giữ nguyên ... */ };

const FormLayoutManager = () => {
    const navigator = useNavigate(); // << 2. KHỞI TẠO NAVIGATOR

    // ... các state giữ nguyên ...
    const [treeData, setTreeData] = useState([]);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isFieldEditorModalOpen, setIsFieldEditorModalOpen] = useState(false);
    const [selectedFormForFields, setSelectedFormForFields] = useState(null);
    // ...

    // ... các hàm xử lý khác giữ nguyên ...
    const fetchData = useCallback(async () => { /* ... */ }, []);
    useEffect(() => { fetchData() }, [fetchData]);
    const handleSubmitItemForm = async (e) => { /* ... */ };
    const handleDeleteItem = (id, name, type) => { /* ... */ };
    const handleOpenFieldEditor = (formItem) => { /* ... */ };
    // ...

    // << 3. THÊM LẠI HÀM XỬ LÝ ĐIỀU HƯỚNG LAYOUT
    const handleLayout = (formId) => {
        navigator(`/admin/layout/${formId.replace('form-', '')}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                {/* ... JSX tiêu đề và các nút ... */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[50vh] group">
                    {treeData.length > 0 ? (
                        treeData.map((item) => (
                            <FormTreeItem
                                key={item.id}
                                item={item}
                                onEdit={handleEditItem}
                                onDelete={handleDeleteItem}
                                onAddChild={handleAddChild}
                                onEditFields={handleOpenFieldEditor}
                                onLayout={handleLayout} // << 4. TRUYỀN HÀM XUỐNG
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Chưa có biểu mẫu hay thư mục nào.</p>
                    )}
                </div>

                {/* ... JSX của cả 2 Modal giữ nguyên ... */}
                {isItemModalOpen && ( /* ... */ )}
            </div>

            {isFieldEditorModalOpen && (
                <FieldEditorModal
                    formInfo={selectedFormForFields}
                    onClose={() => setIsFieldEditorModalOpen(false)}
                />
            )}
        </div>
    );
};

export default FormLayoutManager;