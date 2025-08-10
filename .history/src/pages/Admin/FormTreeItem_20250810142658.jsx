// src/components/admin/FormTreeItem.js

import React, { useState } from 'react';
import {
    FolderIcon, DocumentTextIcon, ChevronRightIcon, ChevronDownIcon,
    PlusIcon, PencilIcon, TrashIcon, Cog6ToothIcon // Đổi icon layout thành icon cài đặt
} from '@heroicons/react/24/outline';

/**
 * Component hiển thị một mục trong cây thư mục.
 * @param {function} onEditFields - HÀM MỚI: Xử lý sự kiện mở modal chỉnh sửa trường.
 * @param {function} onLayout - ĐÃ BỊ LOẠI BỎ, thay bằng onEditFields.
 */
const FormTreeItem = ({ item, onEdit, onDelete, onAddChild, onEditFields, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const paddingLeft = `${depth * 1.5}rem`;

    const getIcon = () => {
        switch (item.type) {
            case 'folder': return <FolderIcon className="w-5 h-5 text-yellow-500" />;
            case 'form': return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
            default: return null;
        }
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(item.id, item.name, item.type); // Không cần window.confirm ở đây nếu đã có ở component cha
    };

    const handleEditClick = (e) => {
        e.stopPropagation();
        onEdit(item);
    };

    const handleAddChildClick = (e) => {
        e.stopPropagation();
        onAddChild(item.id, item.name);
    };

    // HÀM MỚI: Xử lý khi nhấn nút chỉnh sửa trường
    const handleEditFieldsClick = (e) => {
        e.stopPropagation();
        onEditFields(item);
    };


    return (
        <div className="flex flex-col">
            <div
                className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                style={{ paddingLeft }}
                onClick={() => setIsExpanded(!isExpanded)} // Mở/đóng khi click vào dòng
            >
                {/* Nút Mở/Đóng */}
                <div className="w-6 text-center">
                    {item.children && item.children.length > 0 && (
                        isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />
                    )}
                </div>

                <span className="mr-2">{getIcon()}</span>
                <span className="flex-grow text-sm font-medium text-gray-800">{item.name}</span>

                {/* Các nút chức năng */}
                <div className="flex items-center gap-2">
                    {item.type === 'form' && (
                        <button
                            onClick={handleEditFieldsClick}
                            className="p-1 text-gray-500 hover:text-teal-600 transition-transform duration-200 hover:scale-125"
                            title="Chỉnh sửa các trường"
                        >
                            <Cog6ToothIcon className="w-5 h-5" />
                        </button>
                    )}
                    {item.type === 'folder' && (
                        <button
                            onClick={handleAddChildClick}
                            className="p-1 text-gray-500 hover:text-purple-600 transition-transform duration-200 hover:scale-125"
                            title="Thêm mục con"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={handleEditClick}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-transform duration-200 hover:scale-125"
                        title="Đổi tên"
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="p-1 text-gray-500 hover:text-red-600 transition-transform duration-200 hover:scale-125"
                        title="Xóa"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Render các mục con */}
            {isExpanded && item.children && item.children.length > 0 && (
                <div className="pl-4 border-l border-gray-200 ml-6">
                    {item.children.map((child) => (
                        <FormTreeItem
                            key={child.id}
                            item={child}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                            onEditFields={onEditFields} // Truyền prop xuống cho các cấp con
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FormTreeItem;