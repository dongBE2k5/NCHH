import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FormTreeItem from './FormTreeItem';
import FolderService from '../../service/FolderService';
import FormTemplateService from '../../service/FormTemplateService';

// Build tree từ cả folders và forms
const buildTree = (folders, forms) => {
  const map = new Map();
  const tree = [];

  const folderItems = folders.map(item => ({
    id: item.id,
    name: item.name,
    isFolder: true,
    parentId: item.parent_id === item.id ? null : item.parent_id,
    children: []
  }));

  const formItems = forms.map(item => ({
    id: `form-${item.id}`,
    name: item.name,
    isFolder: false,
    parentId: item.parent_id,
    children: []
  }));

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
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => sortTree(node.children));
  };

  sortTree(tree);
  return tree;
};

const FormManagement = () => {
  const [formData, setFormData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [message, setMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentFormId, setCurrentFormId] = useState(null);
  const [isFolder, setIsFolder] = useState(false);
  const [parentFolderId, setParentFolderId] = useState(null);
  const [parentFolderName, setParentFolderName] = useState('');
  const navigator = useNavigate();

  const showMessage = useCallback((msg, type = 'info') => {
    setMessage({ text: msg, type });
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchForms = useCallback(async () => {
    try {
      const [folders, forms] = await Promise.all([
        FolderService.fetchForms(),
        FormTemplateService.fetchForms()
      ]);
      const tree = buildTree(folders, forms);
      setFormData(tree);
      showMessage('Tải dữ liệu thành công!', 'success');
    } catch (err) {
      console.error(err);
      showMessage('Tải dữ liệu thất bại.', 'error');
    }
  }, [showMessage]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        if (isFolder) {
          await FolderService.updateForm(currentFormId, formName);
        } else {
          await FormTemplateService.updateForm(currentFormId.replace('form-', ''), formName);
        }
        showMessage('Cập nhật thành công!', 'success');
      } else {
        if (isFolder) {
          await FolderService.saveForm(formName, parentFolderId, 1);
        } else {
          await FormTemplateService.saveForm(formName, parentFolderId);
        }
        showMessage('Tạo mới thành công!', 'success');
      }
      setIsModalOpen(false);
      fetchForms();
    } catch (err) {
      console.error(err);
      showMessage('Lưu thất bại.', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    try {
      if (typeof id === 'string') {
        const formId = parseInt(id.replace('form-', ''));
        await FormTemplateService.deleteForm(formId);
      } else {
        await FolderService.deleteForm(id);
      }
      showMessage(`Đã xoá "${name}" thành công`, 'success');
      fetchForms();
    } catch (err) {
      showMessage(`Xoá thất bại: ${err.message}`, 'error');
    }
  };

  const handleNewRootItem = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormName('');
    setIsFolder(false);
    setParentFolderId(null);
    setParentFolderName('');
  };

  const handleAddChild = (parentId, parentName) => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormName('');
    setIsFolder(false);
    setParentFolderId(parentId);
    setParentFolderName(parentName);
  };

  const handleEdit = (id, name, isFolderItem, parentId) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setFormName(name);
    setCurrentFormId(id);
    setIsFolder(isFolderItem);
    setParentFolderId(parentId);
    setParentFolderName('');
  };

  const handleLayout = (id) => {
    if (typeof id === 'string') {
      const formId = id.replace('form-', '');
      navigator(`/admin/layout/${formId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-inter">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">Quản lý Biểu mẫu</h2>
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
          {formData.length > 0 ? (
            formData.map((item) => (
              <FormTreeItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                onLayout={handleLayout}
                showMessage={showMessage}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Không có dữ liệu biểu mẫu nào.</p>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {isEditMode ? 'Chỉnh sửa Biểu mẫu/Thư mục' : `Tạo ${parentFolderId ? 'mới trong ' + parentFolderName : 'mới'}`}
              </h2>

              <form onSubmit={handleSubmitForm}>
                <div className="mb-5">
                  <label htmlFor="formName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên Biểu mẫu/Thư mục
                  </label>
                  <input
                    type="text"
                    id="formName"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {!isEditMode && (
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Loại</label>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="itemType"
                          className="form-radio text-blue-600 h-5 w-5"
                          value="form"
                          checked={!isFolder}
                          onChange={() => setIsFolder(false)}
                        />
                        <span className="ml-2 text-gray-700">Biểu mẫu</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="itemType"
                          className="form-radio text-blue-600 h-5 w-5"
                          value="folder"
                          checked={isFolder}
                          onChange={() => setIsFolder(true)}
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
