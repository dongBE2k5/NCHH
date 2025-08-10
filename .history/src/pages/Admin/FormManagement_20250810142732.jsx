// src/components/admin/FormLayoutManager.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import FormTreeItem from './FormTreeItem';
import FolderService from '../../service/FolderService';
import FormTemplateService from '../../service/FormTemplateService';
import FieldEditorModal from './FieldEditorModal'; // Import modal mới

// Hàm buildTree giữ nguyên
const buildTree = (folders, forms) => { /* ... */ };

const FormLayoutManager = () => {
    // State gốc
    const [treeData, setTreeData] = useState([]);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    // ... các state khác cho modal tạo/sửa item

    // State mới để điều khiển modal chỉnh sửa trường
    const [isFieldEditorModalOpen, setIsFieldEditorModalOpen] = useState(false);
    const [selectedFormForFields, setSelectedFormForFields] = useState(null);

    // fetchData và các hàm xử lý item (thêm, sửa tên, xóa) giữ nguyên
    const fetchData = useCallback(async () => { /* ... */ }, []);
    useEffect(() => { fetchData() }, [fetchData]);

    const handleSubmitItemForm = async (e) => { /* ... */ };
    const handleNewRootItem = () => { /* ... */ };
    const handleAddChild = (parentId, parentName) => { /* ... */ };
    const handleEditItem = (item) => { /* ... */ };

    // Sửa lại hàm Xóa để có thêm logic đóng modal nếu cần
    const handleDeleteItem = async (id, name, type) => {
        Swal.fire({
            title: `Bạn chắc chắn muốn xoá "${name}"?`,
            text: type === 'folder' ? "Việc này sẽ xoá thư mục và toàn bộ biểu mẫu/thư mục con bên trong!" : "Hành động này không thể hoàn tác.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Vâng, xoá nó!',
            cancelButtonText: 'Hủy'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (type === 'form') {
                        await FormTemplateService.deleteForm(id.replace('form-', ''));
                    } else if (type === 'folder') {
                        await FolderService.deleteForm(id);
                    }
                    Swal.fire('Đã xóa!', `"${name}" đã được xóa.`, 'success');
                    fetchData();

                    // Nếu form đang mở trong modal bị xóa, hãy đóng modal
                    if (selectedFormForFields && `form-${selectedFormForFields.id}` === id) {
                        setIsFieldEditorModalOpen(false);
                        setSelectedFormForFields(null);
                    }
                } catch (err) { /* ... */ }
            }
        });
    };


    // Hàm mới để mở modal chỉnh sửa trường
    const handleOpenFieldEditor = (formItem) => {
        setSelectedFormForFields({
            id: formItem.id.replace('form-', ''),
            name: formItem.name
        });
        setIsFieldEditorModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-inter">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900">Quản lý biểu mẫu</h2>
                    <button onClick={handleNewRootItem} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">+ Tạo Mới</button>
                </div>
                {/* ... */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {treeData.length > 0 ? (
                        treeData.map((item) => (
                            <FormTreeItem
                                key={item.id}
                                item={item}
                                onEdit={handleEditItem}
                                onDelete={handleDeleteItem}
                                onAddChild={handleAddChild}
                                onEditFields={handleOpenFieldEditor} // Dùng prop mới
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Không có dữ liệu nào.</p>
                    )}
                </div>
                {/* ... Modal cũ để tạo/sửa tên ... */}
                {isItemModalOpen && ( /* ... */ )}
            </div>

            {/* Render Modal chỉnh sửa trường */}
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