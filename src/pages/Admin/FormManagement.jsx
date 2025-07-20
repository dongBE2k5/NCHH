// FormManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import FormTreeItem from './FormTreeItem';
import FolderService from '../../service/FolderService';
import FormTemplateService from '../../service/FormTemplateService';
import NoteService from '../../service/NoteService';

// Build tree from folders, forms, and notes
const buildTree = (folders, forms, notes) => {
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
    type: 'form',
    parentId: item.parent_id ? item.parent_id : null,
    children: []
  }));

  const noteItems = notes.map(item => ({
    id: `note-${item.id}`,
    name: item.name,
    content: item.content, // Ensure content is included
    type: 'note',
    parentId: item.parent_id ? item.parent_id : null,
    children: []
  }));

  const allItems = [...folderItems, ...formItems, ...noteItems];
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
      // Prioritize folders, then forms, then notes, then alphabetical by name
      const typeOrder = { 'folder': 1, 'form': 2, 'note': 3 };
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
  const [itemContent, setItemContent] = useState(''); // State for note content
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
      const [folders, forms, notes] = await Promise.all([
        FolderService.fetchForms(),
        FormTemplateService.fetchForms(),
        NoteService.fetchNotes()
      ]);
      const tree = buildTree(folders, forms, notes);
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
          await FormTemplateService.updateForm(currentItemId.replace('form-', ''), itemName);
        } else if (itemType === 'note') {
          await NoteService.updateNote(currentItemId.replace('note-', ''), itemName, itemContent);
        }
        showMessage('Cập nhật thành công!', 'success');
      } else {
        // Create mode
        if (itemType === 'folder') {
          await FolderService.saveForm(itemName, parentFolderId, 1);
        } else if (itemType === 'form') {
          await FormTemplateService.saveForm(itemName, parentFolderId);
        } else if (itemType === 'note') {
          await NoteService.saveNote(itemName, itemContent, parentFolderId); // Pass content for new note
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
      } else if (type === 'note') {
        await NoteService.deleteNote(id.replace('note-', ''));
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
    // Set content only if the item is a note
    if (item.type === 'note') {
      setItemContent(item.content || '');
    } else {
      setItemContent(''); // Clear content if not a note
    }
    setParentFolderName('');
  };

  const handleLayout = (id) => {
    navigator(`/admin/layout/${id.replace('form-', '')}`);
  };

  // handleViewNote now displays content using Swal.fire
  const handleViewNote = (noteName, noteContent) => {
    Swal.fire({
      title: noteName,
      html: `<div style="text-align: left; max-height: 400px; overflow-y: auto; padding: 10px; border: 1px solid #eee; border-radius: 5px; background: #f9f9f9;">
               <pre style="margin: 0; white-space: pre-wrap; word-break: break-word;">${noteContent || 'Không có nội dung.'}</pre>
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
          <h2 className="text-3xl font-extrabold text-gray-900">Quản lý Dữ liệu</h2>
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
                onViewNote={handleViewNote}
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
                {isEditMode ? `Chỉnh sửa ${itemType === 'folder' ? 'Thư mục' : itemType === 'form' ? 'Biểu mẫu' : 'Ghi chú'}` : `Tạo mới ${parentFolderName ? `trong ${parentFolderName}` : 'ở thư mục gốc'}`}
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

                {/* Show content textarea only for notes, in both edit and create modes */}
                {(itemType === 'note') && (
                  <div className="mb-5">
                    <label htmlFor="itemContent" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nội dung
                    </label>
                    <textarea
                      id="itemContent"
                      value={itemContent}
                      onChange={(e) => setItemContent(e.target.value)}
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
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
                          onChange={() => {setItemType('form'); setItemContent('');}} // Reset content when switching type
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
                          onChange={() => {setItemType('folder'); setItemContent('');}} // Reset content when switching type
                        />
                        <span className="ml-2 text-gray-700">Thư mục</span>
                      </label>
                      {/* Radio for Ghi chú */}
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="itemType"
                          className="form-radio text-blue-600 h-5 w-5"
                          value="note"
                          checked={itemType === 'note'}
                          onChange={() => setItemType('note')} // Keep content if switching to note
                        />
                        <span className="ml-2 text-gray-700">Ghi chú</span>
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