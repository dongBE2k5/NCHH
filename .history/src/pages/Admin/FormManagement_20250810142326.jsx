import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import FormTreeItem from './FormTreeItem';
import FolderService from '../../service/FolderService';
import FormTemplateService from '../../service/FormTemplateService';
// Loại bỏ import NoteService: import NoteService from '../../service/NoteService';

// Build tree from folders and forms (forms can now have notes)
const buildTree = (folders, forms) => { // Loại bỏ 'notes' khỏi tham số
  const map = new Map();
  const tree = [];

  const folderItems = folders.map(item => ({
    id: item.id,
    name: item.name,
    type: 'folder',
    parentId: item.parent_id === item.id ? null : item.parent_id,
    children: []
  }));

  const formItems = forms.map(item => ({
    id: `form-${item.id}`,
    name: item.name,
    // Giả sử item.note là trường chứa nội dung ghi chú của form
    note: item.note || '', // Đảm bảo note được bao gồm
    type: 'form', // Tất cả giờ đều là 'form', không còn 'note' riêng
    parentId: item.parent_id ? item.parent_id : null,
    children: []
  }));

  // Ghép nối folderItems và formItems. Không còn noteItems riêng biệt.
  const allItems = [...folderItems, ...formItems];
  allItems.forEach(item => map.set(item.id, item));

  allItems.forEach(item => {
    if (item.parentId === null || !map.has(item.parentId)) {
      tree.push(item);
    } else {
      map.get(item.parentId).children.push(item);
    }
  });

  const sortTree = (nodes) => {
    nodes.sort((a, b) => {
      // Prioritize folders, then forms, then alphabetical by name
      const typeOrder = { 'folder': 1, 'form': 2 }; // Loại bỏ 'note'
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return a.name.localeCompare(b.name);
    });
    nodes.forEach(node => sortTree(node.children));
  };

  sortTree(tree);
  return tree;
};

const FormManagement = () => {
  const [treeData, setTreeData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemContent, setItemContent] = useState(''); // State for form note content
  const [message, setMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [itemType, setItemType] = useState('form'); // Default to 'form'
  const [parentFolderId, setParentFolderId] = useState(null);
  const [parentFolderName, setParentFolderName] = useState('');
  const navigator = useNavigate();

  const showMessage = useCallback((msg, type = 'info') => {
    setMessage({ text: msg, type });
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      // Chỉ fetch folders và forms (forms giờ có thể chứa note)
      const [folders, forms] = await Promise.all([
        FolderService.fetchForms(),
        FormTemplateService.fetchForms(),
      ]);
      const tree = buildTree(folders, forms); // Truyền forms thay vì notes
      setTreeData(tree);
      showMessage('Tải dữ liệu thành công!', 'success');
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      showMessage('Tải dữ liệu thất bại.', 'error');
    }
  }, [showMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // Edit mode
        if (itemType === 'folder') {
          await FolderService.updateForm(currentItemId, itemName);
        } else if (itemType === 'form') {
          // Cập nhật form, truyền cả note nếu có
          await FormTemplateService.updateForm(currentItemId.replace('form-', ''), itemName, itemContent);
        }
        showMessage('Cập nhật thành công!', 'success');
      } else {
        // Create mode
        if (itemType === 'folder') {
          await FolderService.saveForm(itemName, parentFolderId, 1);
        } else if (itemType === 'form') {
          // Tạo mới form, truyền cả note
          await FormTemplateService.saveForm(itemName, parentFolderId, itemContent);
        }
        showMessage('Tạo mới thành công!', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Lỗi khi lưu dữ liệu:", err);
      showMessage('Lưu thất bại.', 'error');
    }
  };

  const handleDelete = async (id, name, type) => {
    try {
      if (type === 'form') {
        await FormTemplateService.deleteForm(id.replace('form-', ''));
      } else if (type === 'folder') {
        await FolderService.deleteForm(id);
      }
      showMessage(`Đã xoá "${name}" thành công`, 'success');
      fetchData();
    } catch (err) {
      console.error("Lỗi khi xoá:", err);
      showMessage(`Xoá thất bại: ${err.message}`, 'error');
    }
  };

  const handleNewRootItem = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setItemName('');
    setItemContent(''); // Reset content for new item
    setItemType('form'); // Default type for new root item
    setParentFolderId(null);
    setParentFolderName('');
  };

  const handleAddChild = (parentId, parentName) => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setItemName('');
    setItemContent(''); // Reset content for new child item
    setItemType('form'); // Default type for new child item
    setParentFolderId(parentId);
    setParentFolderName(parentName);
  };

  // Modified handleEdit to receive the full item object
  const handleEdit = (item) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setItemName(item.name);
    setCurrentItemId(item.id);
    setItemType(item.type);
    setParentFolderId(item.parentId);
    // Set content if the item is a form and has a note
    if (item.type === 'form') { // Kiểm tra nếu là 'form'
      setItemContent(item.note || ''); // Lấy nội dung note từ item.note
    } else {
      setItemContent(''); // Clear content if not a form
    }
    setParentFolderName('');
  };

  const handleLayout = (id) => {
    navigator(`/admin/layout/${id.replace('form-', '')}`);
  };

  // handleViewNote giờ thành handleViewFormNote
  const handleViewFormNote = (formName, formNoteContent) => {
    Swal.fire({
      title: `Nội dung ghi chú của Biểu mẫu: ${formName}`,
      html: `<div style="text-align: left; max-height: 400px; overflow-y: auto; padding: 10px; border: 1px solid #eee; border-radius: 5px; background: #f9f9f9;">
               <pre style="margin: 0; white-space: pre-wrap; word-break: break-word;">${formNoteContent || 'Không có nội dung ghi chú.'}</pre>
             </div>`,
      icon: 'info',
      confirmButtonText: 'Đóng',
      customClass: {
        container: 'my-swal-container',
        popup: 'my-swal-popup',
        title: 'my-swal-title',
        htmlContainer: 'my-swal-html',
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-inter">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">Quản lý biểu m</h2>
          <button
            onClick={handleNewRootItem}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
          >
            + Tạo Mới
          </button>
        </div>

        {message && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-green-100 text-green-800' :
            message.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          {treeData.length > 0 ? (
            treeData.map((item) => (
              <FormTreeItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                onLayout={handleLayout}
                onViewNote={handleViewFormNote}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Không có dữ liệu nào.</p>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {isEditMode ? `Chỉnh sửa ${itemType === 'folder' ? 'Thư mục' : 'Biểu mẫu'}` : `Tạo mới ${parentFolderName ? `trong ${parentFolderName}` : 'ở thư mục gốc'}`}
              </h2>

              <form onSubmit={handleSubmitForm}>
                <div className="mb-5">
                  <label htmlFor="itemName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên
                  </label>
                  <input
                    type="text"
                    id="itemName"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Show content textarea only if the itemType is 'form' */}
                {(itemType === 'form') && (
                  <div className="mb-5">
                    <label htmlFor="itemContent" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nội dung ghi chú (tùy chọn)
                    </label>
                    <textarea
                      id="itemContent"
                      value={itemContent}
                      onChange={(e) => setItemContent(e.target.value)}
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                )}

                {!isEditMode && (
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Loại</label>
                    <div className="flex items-center gap-4">
                      {/* Radio for Biểu mẫu */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="itemType"
                          className="form-radio text-blue-600 h-5 w-5"
                          value="form"
                          checked={itemType === 'form'}
                          onChange={() => {setItemType('form');}} // Giữ itemContent khi chuyển sang form
                        />
                        <span className="ml-2 text-gray-700">Biểu mẫu</span>
                      </label>
                      {/* Radio for Thư mục */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="itemType"
                          className="form-radio text-blue-600 h-5 w-5"
                          value="folder"
                          checked={itemType === 'folder'}
                          onChange={() => {setItemType('folder'); setItemContent('');}} // Reset content khi chuyển sang folder
                        />
                        <span className="ml-2 text-gray-700">Thư mục</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    {isEditMode ? 'Cập nhật' : 'Lưu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormManagement;