// src/components/admin/FormLayoutManager.js

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import FormTreeItem from './FormTreeItem';
import FolderService from '../../service/FolderService';
import FormTemplateService from '../../service/FormTemplateService';
import FieldEditorModal from './FieldEditorModal';

const buildTree = (folders, forms) => {
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
        note: item.note || '',
        type: 'form',
        parentId: item.parent_id ? item.parent_id : null,
        children: []
    }));

    const allItems = [...folderItems, ...formItems];
    allItems.forEach(item => map.set(item.id, item));

    allItems.forEach(item => {
        if (item.parentId === null || !map.has(item.parentId)) {
            tree.push(item);
        } else {
            const parent = map.get(item.parentId);
            if (parent) parent.children.push(item);
        }
    });

    const sortTree = (nodes) => {
        nodes.sort((a, b) => {
            const typeOrder = { 'folder': 1, 'form': 2 };
            if (typeOrder[a.type] !== typeOrder[b.type]) {
                return typeOrder[a.type] - typeOrder[b.type];
            }
            return a.name.localeCompare(b.name);
        });
        nodes.forEach(node => node.children && sortTree(node.children));
    };

    sortTree(tree);
    return tree;
};

const FormLayoutManager = () => {
    const navigator = useNavigate();
    const [treeData, setTreeData] = useState([]);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemContent, setItemContent] = useState('');
    const [isItemModalInEditMode, setIsItemModalInEditMode] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [itemType, setItemType] = useState('form');
    const [parentFolderId, setParentFolderId] = useState(null);
    const [parentFolderName, setParentFolderName] = useState('');
    const [isFieldEditorModalOpen, setIsFieldEditorModalOpen] = useState(false);
    const [selectedFormForFields, setSelectedFormForFields] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [folders, forms] = await Promise.all([
                FolderService.fetchForms(),
                FormTemplateService.fetchForms(),
            ]);
            const tree = buildTree(folders, forms);
            setTreeData(tree);
        } catch (err) {
            console.error("Lỗi khi tải cây thư mục:", err);
            Swal.fire('Lỗi!', 'Tải dữ liệu cây thư mục thất bại.', 'error');
        }
    }, []);

    useEffect(() => {
        fetchData()
    }, [fetchData]);

    const handleSubmitItemForm = async (e) => {
        e.preventDefault();
        try {
            if (isItemModalInEditMode) {
                if (itemType === 'folder') {
                    await FolderService.updateForm(currentItemId, itemName);
                } else if (itemType === 'form') {
                    await FormTemplateService.updateForm(currentItemId.replace('form-', ''), itemName, itemContent);
                }
            } else {
                if (itemType === 'folder') {
                    await FolderService.saveForm(itemName, parentFolderId, 1);
                } else if (itemType === 'form') {
                    await FormTemplateService.saveForm(itemName, parentFolderId, itemContent);
                }
            }
            Swal.fire('Thành công!', 'Thao tác đã được thực hiện.', 'success');
            setIsItemModalOpen(false);
            fetchData();
        } catch (err) {
            Swal.fire('Thất bại!', 'Lưu dữ liệu thất bại.', 'error');
        }
    };

    const handleNewRootItem = () => {
        setIsItemModalOpen(true);
        setIsItemModalInEditMode(false);
        setItemName('');
        setItemContent('');
        setItemType('form');
        setParentFolderId(null);
        setParentFolderName('');
    };

    const handleAddChild = (parentId, parentName) => {
        setIsItemModalOpen(true);
        setIsItemModalInEditMode(false);
        setItemName('');
        setItemContent('');
        setItemType('form');
        setParentFolderId(parentId);
        setParentFolderName(parentName);
    };

    const handleEditItem = (item) => {
        setIsItemModalOpen(true);
        setIsItemModalInEditMode(true);
        setItemName(item.name);
        setCurrentItemId(item.id);
        setItemType(item.type);
        setParentFolderId(item.parentId);
        setItemContent(item.type === 'form' ? item.note || '' : '');
    };

    const handleDeleteItem = (id, name, type) => {
        Swal.fire({
            title: `Bạn chắc chắn muốn xoá "${name}"?`,
            text: type === 'folder' ? "Hành động này sẽ xoá toàn bộ thư mục con và biểu mẫu bên trong!" : "Hành động này không thể hoàn tác.",
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
                    if (selectedFormForFields && `form-${selectedFormForFields.id}` === id) {
                        setIsFieldEditorModalOpen(false);
                        setSelectedFormForFields(null);
                    }
                } catch (err) {
                    Swal.fire('Lỗi!', `Xóa thất bại: ${err.message}`, 'error');
                }
            }
        });
    };

    const handleOpenFieldEditor = (formItem) => {
        setSelectedFormForFields({
            id: formItem.id.replace('form-', ''),
            name: formItem.name
        });
        setIsFieldEditorModalOpen(true);
    };

    const handleLayout = (formId) => {
        navigator(`/admin/layout/${formId.replace('form-', '')}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900">Quản lý biểu mẫu</h2>
                    <button onClick={handleNewRootItem} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">+ Tạo Mới</button>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[50vh] ">
                    {treeData.length > 0 ? (
                        treeData.map((item) => (
                            <FormTreeItem
                                key={item.id}
                                item={item}
                                onEdit={handleEditItem}
                                onDelete={handleDeleteItem}
                                onAddChild={handleAddChild}
                                onEditFields={handleOpenFieldEditor}
                                onLayout={handleLayout}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Chưa có biểu mẫu hay thư mục nào.</p>
                    )}
                </div>

                {isItemModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                {isItemModalInEditMode ? `Chỉnh sửa ${itemType === 'folder' ? 'Thư mục' : 'Biểu mẫu'}` : `Tạo mới ${parentFolderName ? `trong ${parentFolderName}` : 'ở thư mục gốc'}`}
                            </h2>
                            <form onSubmit={handleSubmitItemForm}>
                                <div className="mb-5">
                                    <label htmlFor="itemName" className="block text-sm font-semibold text-gray-700 mb-2">Tên</label>
                                    <input type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                </div>
                                {!isItemModalInEditMode && (
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Loại</label>
                                        <div className="flex items-center gap-4">
                                            <label className="inline-flex items-center">
                                                <input type="radio" name="itemType" className="form-radio text-blue-600 h-5 w-5" value="form" checked={itemType === 'form'} onChange={() => { setItemType('form'); }} />
                                                <span className="ml-2 text-gray-700">Biểu mẫu</span>
                                            </label>
                                            <label className="inline-flex items-center">
                                                <input type="radio" name="itemType" className="form-radio text-blue-600 h-5 w-5" value="folder" checked={itemType === 'folder'} onChange={() => { setItemType('folder'); setItemContent(''); }} />
                                                <span className="ml-2 text-gray-700">Thư mục</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                                {itemType === 'form' && (
                                    <div className="mb-5">
                                        <label htmlFor="itemContent" className="block text-sm font-semibold text-gray-700 mb-2">Nội dung ghi chú (tùy chọn)</label>
                                        <textarea id="itemContent" value={itemContent} onChange={(e) => setItemContent(e.target.value)} rows="5"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                    </div>
                                )}
                                <div className="flex justify-end gap-3 mt-6">
                                    <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Hủy</button>
                                    <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">{isItemModalInEditMode ? 'Cập nhật' : 'Lưu'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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