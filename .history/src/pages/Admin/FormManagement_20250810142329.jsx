// src/components/admin/FormLayoutManager.js

import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import FormTreeItem from './FormTreeItem';
import FolderService from '../../service/FolderService';
import FormTemplateService from '../../service/FormTemplateService';

// Import component Modal mới
import FieldEditorModal from './FieldEditorModal';

// Hàm buildTree giữ nguyên
const buildTree = (folders, forms) => { /* ... */ };

export default function FormLayoutManager() {
    // State gốc của FormLayoutManager
    const [treeData, setTreeData] = useState([]);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    // ... các state khác giữ nguyên

    // === STATE MỚI ĐỂ ĐIỀU KHIỂN MODAL CHỈNH SỬA TRƯỜNG ===
    const [isFieldEditorModalOpen, setIsFieldEditorModalOpen] = useState(false);
    const [selectedFormForFields, setSelectedFormForFields] = useState(null); // Sẽ lưu { id, name }

    // Các hàm gốc giữ nguyên (fetchData, handleSubmitForm, handleDelete, ...)

    // === HÀM MỚI: Mở modal chỉnh sửa trường ===
    const handleOpenFieldEditor = (formItem) => {
        setSelectedFormForFields({
            id: formItem.id.replace('form-', ''), // Lấy ID thuần túy
            name: formItem.name
        });
        setIsFieldEditorModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-inter">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                {/* ... Toàn bộ JSX gốc của FormManagement được giữ lại ... */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900">Quản lý biểu mẫu</h2>
                    {/* ... Nút Tạo Mới ... */}
                </div>
                
                {/* ... Vùng hiển thị message ... */}

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {treeData.length > 0 ? (
                        treeData.map((item) => (
                            <FormTreeItem
                                key={item.id}
                                item={item}
                                onEdit={handleEditItem} // Prop cũ để sửa tên/note
                                onDelete={handleDeleteItem} // Prop cũ
                                onAddChild={handleAddChild} // Prop cũ
                                
                                // === TRUYỀN PROP MỚI VÀO FormTreeItem ===
                                onEditFields={handleOpenFieldEditor} 
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Không có dữ liệu nào.</p>
                    )}
                </div>

                {/* ... Modal cũ để tạo/sửa thư mục/biểu mẫu ... */}
                {isItemModalOpen && ( /* ... */ )}
            </div>

            {/* === RENDER MODAL MỚI KHI CÓ ĐIỀU KIỆN === */}
            {isFieldEditorModalOpen && (
                <FieldEditorModal
                    formInfo={selectedFormForFields}
                    onClose={() => setIsFieldEditorModalOpen(false)}
                />
            )}
        </div>
    );
};