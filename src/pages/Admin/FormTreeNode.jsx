// src/components/FormTreeNode.jsx
import React, { useState } from 'react';
import { FolderIcon, DocumentTextIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * FormTreeNode Component
 * Component này hiển thị một mục trong cây (Thư mục hoặc Biểu mẫu)
 * với các chức năng hiển thị và lựa chọn phụ thuộc.
 * @param {object} item - Dữ liệu của mục (id, name, type ('folder' | 'form'), children, parentId, folderName for forms).
 * @param {number} depth - Cấp độ sâu của mục trong cây, dùng để thụt lề.
 * @param {Array<number>} selectedForms - Mảng ID của các biểu mẫu hiện đang được chọn (cho checkbox).
 * @param {function} onSelectForm - Hàm callback khi checkbox của biểu mẫu thay đổi.
 * @param {number} currentFormId - ID của biểu mẫu hiện đang được chỉnh sửa (để loại trừ nó khỏi lựa chọn).
 */
const FormTreeNode = ({
    item,
    depth = 0,
    selectedForms,
    onSelectForm,
    currentFormId
}) => {
    // Đặt isExpanded thành true theo mặc định cho chế độ xem cây phụ thuộc
    const [isExpanded, setIsExpanded] = useState(true);

    // Tính toán lề trái dựa trên độ sâu cho mục hiện tại
    const paddingLeft = `${depth * 1.5}rem`;

    // Hàm trợ giúp để lấy biểu tượng dựa trên loại mục, sử dụng Heroicons
    const getIcon = () => {
        switch (item.type) {
            case 'folder':
                return <FolderIcon className="w-5 h-5 text-yellow-500" />;
            case 'form':
                return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
            default:
                return null;
        }
    };

    // Loại trừ biểu mẫu hiện đang được chỉnh sửa khỏi danh sách phụ thuộc
    // Biểu mẫu không thể phụ thuộc vào chính nó
    if (item.type === 'form' && item.id === currentFormId) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <div
                className="flex items-center py-2 px-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
                style={{ paddingLeft }}
            >
                {/* Nút mở rộng/thu gọn cho thư mục có thư mục con */}
                {item.type === 'folder' && item.children && item.children.length > 0 ? (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mr-2 text-gray-600 hover:text-gray-800 focus:outline-none flex-shrink-0" // flex-shrink-0 để nút không bị co lại
                    >
                        {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                    </button>
                ) : (
                    // Phần giữ chỗ cho các mục không thể mở rộng để căn chỉnh với các mục có thể mở rộng
                    <div className="w-6 h-5 mr-2 flex-shrink-0" /> // Đảm bảo chiều rộng và chiều cao cố định
                )}

                {/* Biểu tượng cho Thư mục hoặc Biểu mẫu */}
                <span className="mr-2 flex-shrink-0">{getIcon()}</span>

                {/* Tên mục */}
                <span className="flex-grow text-sm font-medium text-gray-800 truncate"> {/* truncate để xử lý tên dài */}
                    {item.name}
                    {/* Hiển thị tên thư mục cho biểu mẫu nếu có và không phải là thư mục */}
                    {item.type === 'form' && item.folderName && (
                        <span className="text-gray-500 ml-2 text-xs">({item.folderName})</span>
                    )}
                </span>

                {/* Checkbox cho biểu mẫu (chỉ để lựa chọn trong thẻ phụ thuộc của Layout component) */}
                {item.type === 'form' && onSelectForm && (
                    <input
                        type="checkbox"
                        checked={selectedForms.includes(item.id)}
                        onChange={(e) => onSelectForm(item.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ml-auto flex-shrink-0" // ml-auto để đẩy sang phải
                    />
                )}
            </div>

            {/* Hiển thị các mục con nếu được mở rộng */}
            {isExpanded && item.children && item.children.length > 0 && (
                <div className="pl-4 border-l border-gray-200"> {/* Thêm đường kẻ dọc và lề */}
                    {item.children.map((child) => (
                        <FormTreeNode
                            key={child.id}
                            item={child}
                            depth={depth + 1}
                            selectedForms={selectedForms}
                            onSelectForm={onSelectForm}
                            currentFormId={currentFormId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FormTreeNode;