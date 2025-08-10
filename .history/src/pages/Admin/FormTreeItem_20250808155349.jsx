// FormTreeItem.jsx
import React, { useState } from 'react';
// Thay đổi import từ react-icons sang @heroicons/react
import { FolderIcon, DocumentTextIcon, ClipboardDocumentIcon, ChevronRightIcon, ChevronDownIcon, PlusIcon, PencilIcon, TrashIcon, DocumentDuplicateIcon, EyeIcon } from '@heroicons/react/24/outline'; // Thêm các icons mới

/**
 * FormTreeItem Component
 * Component này hiển thị một mục trong cây (Thư mục, Biểu mẫu, hoặc Ghi chú)
 * và các hành động liên quan.
 * @param {object} item - Dữ liệu của mục (id, name, type, children, parentId, content).
 * @param {function} onEdit - Hàm xử lý sự kiện sửa.
 * @param {function} onDelete - Hàm xử lý sự kiện xóa.
 * @param {function} onAddChild - Hàm xử lý sự kiện thêm mục con (chỉ cho thư mục).
 * @param {function} onLayout - Hàm xử lý sự kiện xem layout (chỉ cho biểu mẫu).
 * @param {function} onViewNote - Hàm xử lý sự kiện xem ghi chú (chỉ cho ghi chú).
 * @param {number} depth - Cấp độ sâu của mục trong cây, dùng để thụt lề.
 */
const FormTreeItem = ({ item, onEdit, onDelete, onAddChild, onLayout, onViewNote, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate left padding based on depth
    const paddingLeft = `${depth * 1.5}rem`;

    // Helper function to get icon based on item type, using Heroicons
    const getIcon = () => {
        switch (item.type) {
            case 'folder':
                return <FolderIcon className="w-5 h-5 text-yellow-500" />;
            case 'form':
                return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
            case 'note':
                return <ClipboardDocumentIcon className="w-5 h-5 text-green-500" />;
            default:
                return null;
        }
    };

    const handleDeleteClick = (e) => {
      e.stopPropagation(); // Prevent folder toggle
      if (window.confirm(`Bạn có chắc chắn muốn xóa "${item.name}"?`)) {
        onDelete(item.id, item.name, item.type);
      }
    };

    // Modified handleEditClick to pass the entire item object
    const handleEditClick = (e) => {
      e.stopPropagation(); // Prevent folder toggle
      onEdit(item); // Pass the entire item object
    };

    const handleAddChildClick = (e) => {
      e.stopPropagation(); // Prevent folder toggle
      onAddChild(item.id, item.name);
    };

    const handleLayoutClick = (e) => {
      e.stopPropagation();
      onLayout(item.id);
    };

    // Modified handleViewNoteClick to pass noteName and noteContent
    const handleViewNoteClick = (e) => {
      e.stopPropagation();
      onViewNote(item.name, item.content); // Pass note name and content
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center py-2 px-3 rounded-md hover:bg-gray-50 transition-colors duration-200" style={{ paddingLeft }}>
                {/* Expand/Collapse button for folders with children */}
                {item.type === 'folder' && item.children && item.children.length > 0 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mr-2 text-gray-600 hover:text-white focus:outline-none"
                    >
                        {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                    </button>
                )}

                {/* Icon for Folder, Form, or Note */}
                <span className="mr-2">{getIcon()}</span>

                {/* Item Name */}
                <span className="flex-grow text-sm font-medium text-gray-800">{item.name}</span>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    {/* "Add" button only for Folders */}
                    {item.type === 'folder' && (
                        <button
                            onClick={handleAddChildClick}
                            className="p-1 text-gray-500 hover:text-purple-600 hover:bg-transparent hover:scale-125 transition-colors duration-200"
                            title="Thêm mới"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    )}
                    
                    {/* "Layout" button only for Forms */}
                    {item.type === 'form' && (
                        <button
                            onClick={handleLayoutClick}
                            className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-transparent hover:scale-125 transition-colors duration-200"
                            title="Thiết kế biểu mẫu"
                        >
                            <DocumentDuplicateIcon className="w-4 h-4" /> {/* Changed to DocumentDuplicateIcon for layout */}
                        </button>
                    )}

                    {/* "View" button only for Notes */}
                    {item.type === 'note' && (
                        <button
                            onClick={handleViewNoteClick}
                            className="p-1 text-gray-500 hover:text-teal-600 hover:bg-transparent hover:scale-125 transition-colors duration-200"
                            title="Xem ghi chú"
                        >
                            <EyeIcon className="w-4 h-4" />
                        </button>
                    )}

                    {/* "Edit" button */}
                    <button
                        onClick={handleEditClick}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-transparent hover:scale-125 transition-colors duration-200"
                        title="Chỉnh sửa"
                    >
                        <PencilIcon className="w-4 h-4" />
                    </button>

                    {/* "Delete" button */}
                    <button
                        onClick={handleDeleteClick}
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-transparent hover:scale-125 transition-colors duration-200"
                        title="Xóa"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Render children if expanded */}
            {isExpanded && item.children && item.children.length > 0 && (
                <div className="pl-4 border-l border-gray-200 ml-4">
                    {item.children.map((child) => (
                        <FormTreeItem
                            key={child.id}
                            item={child}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                            onLayout={onLayout}
                            onViewNote={onViewNote}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FormTreeItem;