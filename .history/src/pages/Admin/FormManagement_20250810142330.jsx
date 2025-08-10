import React, { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../service/BaseUrl'; // Giả sử dùng chung BaseUrl
import FolderService from '../../service/FolderService';
import FormTemplateService from '../../service/FormTemplateService';
import FormTreeItem from './FormTreeItem'; // Component con để hiển thị cây

// --- Import Icons từ Heroicons ---
import {
    PlusIcon, ArrowDownTrayIcon, PencilSquareIcon, TrashIcon, ListBulletIcon, DocumentTextIcon,
    EnvelopeIcon, HashtagIcon, Bars3BottomLeftIcon, CheckIcon, FolderIcon, DocumentDuplicateIcon
} from '@heroicons/react/24/solid';

// --- Hàm xây dựng cây thư mục (từ FormManagement) ---
const buildTree = (folders, forms) => {
    const map = new Map();
    const tree = [];

    const folderItems = folders.map(item => ({
        id: item.id, name: item.name, type: 'folder',
        parentId: item.parent_id === item.id ? null : item.parent_id,
        children: []
    }));

    const formItems = forms.map(item => ({
        id: `form-${item.id}`, name: item.name, note: item.note || '',
        type: 'form', parentId: item.parent_id ? item.parent_id : null,
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
        nodes.sort((a, b) => {
            const typeOrder = { 'folder': 1, 'form': 2 };
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

// --- Component Chính Đã Được Kết Hợp ---
export default function FormLayoutManager() {
    // === STATE TỪ FormManagement (Panel trái) ===
    const [treeData, setTreeData] = useState([]);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [itemName, setItemName] = useState('');
    const [itemContent, setItemContent] = useState(''); // Note content for form
    const [message, setMessage] = useState('');
    const [isItemModalInEditMode, setIsItemModalInEditMode] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [itemType, setItemType] = useState('form');
    const [parentFolderId, setParentFolderId] = useState(null);
    const [parentFolderName, setParentFolderName] = useState('');

    // === STATE TỪ CreateFieldForm (Panel phải) ===
    const [selectedFormForFields, setSelectedFormForFields] = useState(null); // Form được chọn để chỉnh sửa trường
    const [fieldsData, setFieldsData] = useState(null); // Dữ liệu trường của form được chọn
    const [customFields, setCustomFields] = useState([]); // Các trường đang được thêm mới
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [isFieldFormInEditMode, setIsFieldFormInEditMode] = useState(false);
    const [fieldToEdit, setFieldToEdit] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // --- Cấu hình chung ---
    const swalCustomClass = { /* ... giữ nguyên ... */ };
    const dataTypeIcons = {
        text: <DocumentTextIcon className="h-5 w-5 text-blue-500" />,
        email: <EnvelopeIcon className="h-5 w-5 text-green-500" />,
        number: <HashtagIcon className="h-5 w-5 text-purple-500" />,
        textarea: <Bars3BottomLeftIcon className="h-5 w-5 text-orange-500" />,
        checkbox: <CheckIcon className="h-5 w-5 text-teal-500" />,
        radio: ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-red-500"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v3.75a.75.75 0 001.5 0V9z" /></svg>),
    };

    // === CÁC HÀM XỬ LÝ (TỪ CẢ 2 COMPONENT) ===

    // --- Hàm xử lý cho Panel Trái (Quản lý cây) ---
    const showMessage = useCallback((msg, type = 'info') => {
        setMessage({ text: msg, type });
        const timer = setTimeout(() => setMessage(''), 3000);
        return () => clearTimeout(timer);
    }, []);

    const fetchTreeData = useCallback(async () => {
        try {
            const [folders, forms] = await Promise.all([
                FolderService.fetchForms(),
                FormTemplateService.fetchForms(),
            ]);
            const tree = buildTree(folders, forms);
            setTreeData(tree);
        } catch (err) {
            console.error("Lỗi khi tải cây thư mục:", err);
            showMessage('Tải cây thư mục thất bại.', 'error');
        }
    }, [showMessage]);

    useEffect(() => {
        fetchTreeData();
    }, [fetchTreeData]);

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
            showMessage('Thao tác thành công!', 'success');
            setIsItemModalOpen(false);
            fetchTreeData();
        } catch (err) {
            showMessage('Thao tác thất bại.', 'error');
        }
    };
    
    const handleDeleteItem = async (id, name, type) => {
         // Thêm xác nhận trước khi xoá
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
                    showMessage(`Đã xoá "${name}"`, 'success');
                    fetchTreeData();
                    // Nếu item đang được chọn để sửa bị xóa, hãy xóa nó khỏi panel phải
                    if (id === selectedFormForFields?.id || `form-${id}` === selectedFormForFields?.id) {
                        setSelectedFormForFields(null);
                        setFieldsData(null);
                    }
                } catch (err) {
                    showMessage(`Xoá thất bại: ${err.message}`, 'error');
                }
            }
        });
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
        if (item.type === 'form') {
            setItemContent(item.note || '');
        } else {
            setItemContent('');
        }
    };
    
    // ĐÂY LÀ HÀM QUAN TRỌNG: Thay vì điều hướng, nó sẽ chọn form để hiển thị bên phải
    const handleSelectFormForEditing = (formItem) => {
        if (formItem.type === 'form') {
            setSelectedFormForFields(formItem);
        } else {
            // Nếu người dùng click vào folder, xóa lựa chọn hiện tại
            setSelectedFormForFields(null);
            setFieldsData(null);
        }
    };
    
    // --- Hàm xử lý cho Panel Phải (Quản lý trường) ---
    const fetchFieldList = useCallback(async (formId) => {
        if (!formId) return;
        try {
            const res = await fetch(`${API_BASE_URL}/forms/${formId}`);
            if (!res.ok) throw new Error('Lỗi khi lấy danh sách trường');
            const data = await res.json();
            setFieldsData(data); // Cập nhật state chứa dữ liệu trường
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi!', text: 'Không thể tải danh sách trường.', customClass: swalCustomClass });
        }
    }, []);

    // Effect để tải trường khi một form được chọn từ cây
    useEffect(() => {
        if (selectedFormForFields?.id) {
            const formId = selectedFormForFields.id.replace('form-', '');
            fetchFieldList(formId);
            // Reset trạng thái chỉnh sửa khi chọn form mới
            setCustomFields([]);
            setIsFieldFormInEditMode(false);
            setFieldToEdit(null);
        }
    }, [selectedFormForFields, fetchFieldList]);

    const handleStoreOrUpdateField = async () => {
        if (isFieldFormInEditMode) {
            await updateFieldForm();
        } else {
            await storeCustomField();
        }
    };
    
    // Các hàm còn lại của CreateFieldForm (updateFieldForm, storeCustomField, deleteField, drag/drop, etc.)
    // được giữ nguyên, chỉ cần đảm bảo chúng sử dụng state `fieldsData` và `selectedFormForFields`.
    // Ví dụ:
    const storeCustomField = useCallback(async () => {
        const formId = selectedFormForFields.id.replace('form-','');
        if (!formId || customFields.length === 0) return;
        setIsSaving(true);
        try {
            await fetch(`${API_BASE_URL}/forms/${formId}`, { /* ... giữ nguyên logic ... */ });
            Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Các trường đã được lưu.', customClass: swalCustomClass });
            setCustomFields([]);
            fetchFieldList(formId);
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi!', text: `Lưu thất bại: ${error.message}`, customClass: swalCustomClass });
        } finally {
            setIsSaving(false);
        }
    }, [selectedFormForFields, customFields, fetchFieldList]);

    const updateFieldForm = useCallback(async () => {
        const formId = selectedFormForFields.id.replace('form-','');
        if (!fieldToEdit || !formId || customFields.length === 0) return;
        setIsSaving(true);
        try {
            await fetch(`${API_BASE_URL}/forms/${formId}/fields/${fieldToEdit.id}`, { /* ... giữ nguyên logic ... */ });
            Swal.fire({ icon: 'success', title: 'Thành công!', text: 'Trường đã được cập nhật.', customClass: swalCustomClass });
            setCustomFields([]);
            setIsFieldFormInEditMode(false);
            setFieldToEdit(null);
            fetchFieldList(formId);
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Lỗi!', text: `Cập nhật thất bại: ${error.message}`, customClass: swalCustomClass });
        } finally {
            setIsSaving(false);
        }
    }, [customFields, fieldToEdit, selectedFormForFields, fetchFieldList]);

    const deleteField = useCallback(async (fieldId) => {
        const formId = selectedFormForFields.id.replace('form-','');
        Swal.fire({ /* ... giữ nguyên logic ... */ }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await fetch(`${API_BASE_URL}/forms/${formId}/fields/${fieldId}`, { method: 'DELETE' });
                    Swal.fire({ icon: 'success', title: 'Đã xóa!', text: 'Trường đã được xóa.', customClass: swalCustomClass });
                    fetchFieldList(formId);
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'Lỗi!', text: `Xóa thất bại: ${error.message}`, customClass: swalCustomClass });
                }
            }
        });
    }, [selectedFormForFields, fetchFieldList]);

    const addCustomField = useCallback(() => { /* ... giữ nguyên ... */ }, []);
    const removeCustomField = useCallback((index) => { /* ... giữ nguyên ... */ }, []);
    const handleCustomFieldChange = useCallback((index, key, value) => { /* ... giữ nguyên ... */ }, []);
    const handleEditField = useCallback((field) => { /* ... giữ nguyên ... */ }, []);
    // v...v... các hàm khác giữ nguyên

    // === JSX KẾT HỢP ===
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
            <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row gap-6">

                {/* ===== PANEL TRÁI: Quản lý cây thư mục và biểu mẫu ===== */}
                <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex-shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FolderIcon className="h-7 w-7 text-blue-600" />
                            <span>Quản lý Biểu mẫu</span>
                        </h2>
                        <button onClick={handleNewRootItem} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 flex items-center gap-2">
                            <PlusIcon className="h-5 w-5" /> Tạo Mới
                        </button>
                    </div>

                    {message && (
                        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>{message.text}</div>
                    )}

                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[50vh]">
                        {treeData.length > 0 ? (
                            treeData.map((item) => (
                                <FormTreeItem
                                    key={item.id}
                                    item={item}
                                    onEdit={handleEditItem}
                                    onDelete={handleDeleteItem}
                                    onAddChild={handleAddChild}
                                    // Thay onLayout bằng onSelectForm và gọi hàm mới
                                    onSelectForm={handleSelectFormForEditing}
                                    // Bỏ onViewNote vì có thể tích hợp vào panel phải
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">Không có dữ liệu.</p>
                        )}
                    </div>
                </div>

                {/* ===== PANEL PHẢI: Quản lý các trường của biểu mẫu đã chọn ===== */}
                <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                    {selectedFormForFields ? (
                        <>
                            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
                                <DocumentDuplicateIcon className="h-7 w-7" />
                                <span>Trường của Biểu mẫu: <span className="text-gray-900">{selectedFormForFields.name}</span></span>
                            </h2>

                            {/* --- Khu vực thêm/sửa trường --- */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                {/* Form thêm/sửa trường sẽ nằm ở đây */}
                                {/* ... giữ nguyên JSX của customFields.map(renderCustomFieldForm) và các nút bấm ... */}
                                <button onClick={addCustomField}>+ Thêm trường mới</button>
                                <button onClick={handleStoreOrUpdateField}>Lưu thay đổi</button>
                            </div>

                            {/* --- Danh sách các trường hiện có --- */}
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Các trường hiện có</h3>
                            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-400px)] pr-2">
                                {fieldsData?.field_form?.length > 0 ? (
                                    fieldsData.field_form.map((field, index) => (
                                        <div key={field.id} /* ... giữ nguyên JSX hiển thị 1 field ... */ >
                                            <span>{field.label}</span>
                                            <div>
                                                <button onClick={() => handleEditField(field)}><PencilSquareIcon className="h-5 w-5" /></button>
                                                <button onClick={() => deleteField(field.id)}><TrashIcon className="h-5 w-5" /></button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 p-8 border-dashed border-2 rounded-lg">
                                        <p>Biểu mẫu này chưa có trường nào.</p>
                                        <p className="text-sm">Hãy sử dụng mục "Thêm trường mới" ở trên.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ListBulletIcon className="h-24 w-24 mb-4" />
                            <h2 className="text-xl font-semibold">Chưa chọn biểu mẫu</h2>
                            <p>Vui lòng chọn một biểu mẫu từ danh sách bên trái để xem và chỉnh sửa các trường.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* --- Modal tạo/sửa Thư mục/Biểu mẫu (từ FormManagement) --- */}
            {isItemModalOpen && (
                <div /* ... giữ nguyên JSX của modal ... */>
                    <form onSubmit={handleSubmitItemForm}>
                        {/* ... Các input và nút bấm của modal ... */}
                    </form>
                </div>
            )}
        </div>
    );
}