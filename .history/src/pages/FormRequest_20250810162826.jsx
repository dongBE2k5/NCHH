import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, PlusCircleIcon, BellAlertIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../service/BaseUrl';
import QuickAddFormRequest from "./QuickAddFormRequest";
import RequestStudentService from "../service/RequestStudentService";
import FolderService from "../service/FolderService";
import MailService from "../service/MailService";

function FormRequest() {
    const [originalForms, setOriginalForms] = useState([]);
    const [stagedForms, setStagedForms] = useState([]);
    const [filteredForms, setFilteredForms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("Tất cả");
    const [filterFormName, setFilterFormName] = useState("Tất cả");
    const [selectedFormIds, setSelectedFormIds] = useState([]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [hasPendingChanges, setHasPendingChanges] = useState(false);
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const [notification, setNotification] = useState({
        recipient: '',
        title: '',
        content: '',
        student_codes_array: []
    });
    const [currentFormForNotification, setCurrentFormForNotification] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationConfig, setConfirmationConfig] = useState({ title: '', message: '', onConfirm: () => {} });
    const [statusToConfirm, setStatusToConfirm] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info');
    const [showAddEditFormModal, setShowAddEditFormModal] = useState(false);
    const [isAddingNewForm, setIsAddingNewForm] = useState(false);
    const [formBeingEdited, setFormBeingEdited] = useState(null);
    const [formModalData, setFormModalData] = useState({
        student: '',
        mssv: '',
        name: '',
        date: '',
        status: 'Đang chờ duyệt'
    });
    const [studentSearchError, setStudentSearchError] = useState('');
    const [isStudentSearching, setIsStudentSearching] = useState(false);
    const [availableFormNames, setAvailableFormNames] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successModalMessage, setSuccessModalMessage] = useState('');
    const [showQuickAddModal, setShowQuickAddModal] = useState(false);

    useEffect(() => {
        const fetchFolderNames = async () => {
            try {
                const res = await FolderService.fetchForms();
                const folderNames = res.map(folder => ({
                    id: folder.id,
                    name: folder.name
                }));
                setAvailableFormNames(folderNames);
            } catch (err) {
                console.error('Lỗi khi tải folder từ API:', err);
            }
        };
        fetchFolderNames();
    }, []);

    useEffect(() => {
        const fetchFormRequests = async () => {
            try {
                const data = await RequestStudentService.fetchAll();
                const formatted = data.map(item => ({
                    id: item.id,
                    student: item.student_name ?? "N/A",
                    mssv: item.student_code,
                    name: item.folder_name,
                    date: new Date(item.created_at).toLocaleDateString("vi-VN"),
                    updatedDate: new Date(item.updated_at).toLocaleDateString("vi-VN"), // THÊM DỮ LIỆU
                    status: item.status ?? "Đang chờ duyệt"
                }));
                setOriginalForms(formatted);
                setStagedForms(formatted);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu từ API /request-students", err);
            }
        };
        fetchFormRequests();
    }, []);

    const convertToInputDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('/');
        if (parts.length !== 3) return '';
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const convertToDisplayDate = (dateString) => {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length !== 3) return '';
        const [year, month, day] = parts;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    };

    const showCustomToast = (message, type = 'info') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            setToastMessage('');
            setToastType('info');
        }, 4000);
    };

    const sendEmailNotification = async ({ student_codes, title, message }) => {
        try {
            await MailService.sendStudentEmail(title, message, student_codes);
            showCustomToast(`Đã gửi email tự động đến: ${student_codes.join(', ')}`, "success");
        } catch (error) {
            console.error("Lỗi khi gửi email:", error);
            showCustomToast(`Lỗi khi gửi email đến: ${student_codes.join(', ')}`, "error");
        }
    };

    useEffect(() => {
        let currentFilteredForms = [...stagedForms];
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentFilteredForms = currentFilteredForms.filter(form =>
                form.student.toLowerCase().includes(lowerCaseSearchTerm) ||
                form.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                form.mssv.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }
        if (filterStatus !== "Tất cả") {
            currentFilteredForms = currentFilteredForms.filter(form => form.status === filterStatus);
        }
        if (filterFormName !== "Tất cả") {
            currentFilteredForms = currentFilteredForms.filter(form => form.name === filterFormName);
        }
        if (sortColumn) {
            currentFilteredForms.sort((a, b) => {
                let valA = a[sortColumn];
                let valB = b[sortColumn];
                if (sortColumn === 'date' || sortColumn === 'updatedDate') { // CẬP NHẬT SORT
                    const parseDate = (dateString) => {
                        const [day, month, year] = dateString.split('/').map(Number);
                        return new Date(year, month - 1, day);
                    };
                    valA = parseDate(a[sortColumn]);
                    valB = parseDate(b[sortColumn]);
                } else if (typeof valA === 'string') {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }
                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        setFilteredForms(currentFilteredForms);
    }, [searchTerm, filterStatus, filterFormName, stagedForms, sortColumn, sortDirection]);

    const handleSelectForm = (id, isChecked) => {
        setSelectedFormIds(prevIds =>
            isChecked ? [...prevIds, id] : prevIds.filter(formId => formId !== id)
        );
    };

    const handleSelectAllForms = (isChecked) => {
        setSelectedFormIds(isChecked ? filteredForms.map(form => form.id) : []);
    };

    const handleBulkUpdateStatus = (newStatus) => {
        if (selectedFormIds.length === 0) {
            showCustomToast("Vui lòng chọn ít nhất một biểu mẫu để cập nhật.", "warning");
            return;
        }
        setStatusToConfirm(newStatus);
        setConfirmationConfig({
            title: 'Xác nhận cập nhật',
            message: `Bạn chắc chắn muốn cập nhật ${selectedFormIds.length} mục đã chọn sang trạng thái "${newStatus}" không?`,
            onConfirm: () => confirmBulkUpdate(newStatus)
        });
        setShowConfirmationModal(true);
    };

    const confirmBulkUpdate = async (newStatus) => {
        if (!newStatus) return;
        setShowConfirmationModal(false);
        try {
            await RequestStudentService.bulkUpdateStatus(selectedFormIds, newStatus);
            showCustomToast("Đã cập nhật trạng thái thành công!", "success");
            const updatedForms = stagedForms.map(form =>
                selectedFormIds.includes(form.id) ? { ...form, status: newStatus } : form
            );
            setStagedForms(updatedForms);
            setOriginalForms(updatedForms);
            const formsToNotify = updatedForms.filter(form => selectedFormIds.includes(form.id));
            if (newStatus === "Đã duyệt" || newStatus === "Đang chờ duyệt") {
                const title = newStatus === "Đã duyệt" ? "Thông báo duyệt biểu mẫu" : "Thông báo cập nhật trạng thái biểu mẫu";
                const messagePart = newStatus === "Đã duyệt" ? "của bạn đã được duyệt." : "của bạn đã được cập nhật sang trạng thái 'Đang chờ duyệt'.";
                formsToNotify.forEach(form => {
                    sendEmailNotification({
                        student_codes: [form.mssv],
                        title: `${title}: ${form.name}`,
                        message: `Biểu mẫu "${form.name}" ${messagePart} Vui lòng kiểm tra hệ thống để biết thêm chi tiết.`
                    });
                });
            } else if (newStatus === "Bổ sung" || newStatus === "Đã hủy") {
                const recipients = formsToNotify.map(form => `${form.student} (${form.mssv})`).join('; ');
                const studentCodes = formsToNotify.map(form => form.mssv);
                const defaultTitle = newStatus === "Bổ sung" ? "Yêu cầu bổ sung thông tin biểu mẫu" : "Thông báo hủy biểu mẫu";
                setNotification({
                    recipient: recipients,
                    student_codes_array: studentCodes,
                    title: defaultTitle,
                    content: ''
                });
                setCurrentFormForNotification(null);
                setShowNotificationModal(true);
            }
            setSelectedFormIds([]);
            setStatusToConfirm(null);
        } catch (error) {
            console.error("Lỗi khi cập nhật hàng loạt:", error);
            showCustomToast("Lỗi khi cập nhật trạng thái!", "error");
            setStatusToConfirm(null);
        }
    };

    const handleUpdateSingleFormStatus = (formId, newStatus) => {
        const updatedStagedForms = stagedForms.map(form =>
            form.id === formId ? { ...form, status: newStatus } : form
        );
        setStagedForms(updatedStagedForms);
        setHasPendingChanges(true);
        showCustomToast(`Đã chuẩn bị cập nhật. Nhấn 'Lưu thay đổi' để xác nhận.`, "info");
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleOpenNotificationModalForSelected = () => {
        if (selectedFormIds.length === 0) {
            showCustomToast("Vui lòng chọn ít nhất một biểu mẫu.", "warning");
            return;
        }
        const formsToNotify = stagedForms.filter(form => selectedFormIds.includes(form.id));
        const recipients = formsToNotify.map(form => `${form.student} (${form.mssv})`).join('; ');
        const studentCodesToNotify = Array.from(new Set(formsToNotify.map(form => form.mssv)));
        setNotification({
            recipient: recipients,
            student_codes_array: studentCodesToNotify,
            title: 'Thông báo về biểu mẫu học vụ',
            content: ''
        });
        setCurrentFormForNotification(null);
        setShowNotificationModal(true);
    };

    const handleSubmitNotification = async (e) => {
        e.preventDefault();
        if (!notification.recipient || !notification.title || !notification.content) {
            showCustomToast("Vui lòng nhập đầy đủ người nhận, tiêu đề và nội dung.", "error");
            return;
        }
        const finalStudentCodes = notification.student_codes_array;
        if (finalStudentCodes.length === 0) {
            showCustomToast("Không tìm thấy mã số sinh viên hợp lệ.", "error");
            return;
        }
        try {
            const response = await MailService.sendStudentEmail(
                notification.title,
                notification.content,
                finalStudentCodes
            );
            console.log(response);
            if (response.success) {
                setShowNotificationModal(false);
                setNotification({ recipient: '', title: '', content: '', student_codes_array: [] });
                setSuccessModalMessage(`Thông báo đã được gửi thành công đến ${finalStudentCodes.length} sinh viên.`);
                setShowSuccessModal(true);
            } else {
                showCustomToast(response.message || "Lỗi khi gửi thông báo!", "error");
            }
        } catch (error) {
            console.error("Lỗi API khi gửi thông báo:", error);
            showCustomToast("Đã xảy ra lỗi khi gửi thông báo. Vui lòng thử lại.", "error");
        }
    };

    const handleSaveAllChanges = async () => {
        const formsToUpdate = stagedForms.filter(form => {
            const original = originalForms.find(f => f.id === form.id);
            return original && original.status !== form.status;
        });
        if (formsToUpdate.length === 0) {
            showCustomToast("Không có thay đổi nào để lưu.", "info");
            return;
        }
        try {
            const updatePromises = formsToUpdate.map(form =>
                RequestStudentService.update(form.id, { status: form.status })
            );
            await Promise.all(updatePromises);
            const manualNotifyForms = [];
            formsToUpdate.forEach(form => {
                if (form.status === "Đang chờ duyệt" || form.status === "Đã duyệt") {
                    const title = form.status === "Đang chờ duyệt" ? "Thông báo nộp biểu mẫu thành công" : "Thông báo duyệt biểu mẫu";
                    const message = form.status === "Đang chờ duyệt" ? `Biểu mẫu "${form.name}" đã được gửi và đang chờ duyệt.` : `Biểu mẫu "${form.name}" của bạn đã được duyệt.`;
                    sendEmailNotification({ student_codes: [form.mssv], title, message });
                } else if (form.status === "Bổ sung" || form.status === "Đã hủy") {
                    manualNotifyForms.push(form);
                }
            });
            if (manualNotifyForms.length > 0) {
                const recipients = manualNotifyForms.map(form => `${form.student} (${form.mssv})`).join('; ');
                const studentCodes = manualNotifyForms.map(form => form.mssv);
                setNotification({
                    recipient: recipients,
                    student_codes_array: studentCodes,
                    title: "Thông báo về biểu mẫu",
                    content: ""
                });
                setCurrentFormForNotification(null);
                setShowNotificationModal(true);
            }
            setOriginalForms([...stagedForms]);
            setHasPendingChanges(false);
            showCustomToast("Tất cả thay đổi đã được lưu thành công!", "success");
        } catch (error) {
            console.error("Lỗi khi lưu thay đổi:", error);
            showCustomToast("Có lỗi khi lưu thay đổi.", "error");
        }
    };

    const handleDiscardChanges = () => {
        setConfirmationConfig({
            title: 'Hủy bỏ thay đổi',
            message: 'Bạn có chắc chắn muốn hủy bỏ tất cả thay đổi chưa lưu không?',
            onConfirm: () => {
                setStagedForms(originalForms);
                setHasPendingChanges(false);
                setSelectedFormIds([]);
                showCustomToast("Tất cả thay đổi chưa lưu đã được hủy bỏ.", "info");
                setShowConfirmationModal(false);
            }
        });
        setShowConfirmationModal(true);
    };

    const handleOpenAddFormModal = () => {
        setIsAddingNewForm(true);
        setFormBeingEdited(null);
        setFormModalData({
            student: '',
            mssv: '',
            name: availableFormNames.length > 0 ? availableFormNames[0].name : '',
            date: new Date().toISOString().split('T')[0],
            status: 'Đang chờ duyệt'
        });
        setStudentSearchError('');
        setIsStudentSearching(false);
        setShowAddEditFormModal(true);
    };

    const handleOpenEditFormModal = (form) => {
        setIsAddingNewForm(false);
        setFormBeingEdited(form);
        setFormModalData({
            student: form.student,
            mssv: form.mssv,
            name: form.name,
            date: convertToInputDate(form.date),
            status: form.status
        });
        setStudentSearchError('');
        setIsStudentSearching(false);
        setShowAddEditFormModal(true);
    };

    const handleFormModalChange = (e) => {
        const { name, value } = e.target;
        setFormModalData(prev => ({ ...prev, [name]: value }));
        if (name === 'mssv') {
            if (value.trim() !== '') {
                searchStudentByMssv(value.trim());
            } else {
                setFormModalData(prev => ({ ...prev, student: '' }));
                setStudentSearchError('');
            }
        }
    };

    const searchStudentByMssv = async (mssv) => {
        setIsStudentSearching(true);
        setStudentSearchError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/student/search/${mssv}`);
            if (response.data && response.data.length > 0 && response.data[0].name) {
                setFormModalData(prev => ({ ...prev, student: response.data[0].name }));
            } else {
                setFormModalData(prev => ({ ...prev, student: '' }));
                setStudentSearchError('Không tìm thấy sinh viên với MSSV này.');
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm sinh viên:", error);
            setFormModalData(prev => ({ ...prev, student: '' }));
            setStudentSearchError('Lỗi khi tìm kiếm sinh viên. Vui lòng thử lại.');
        } finally {
            setIsStudentSearching(false);
        }
    };

    const handleSubmitAddEditForm = async (e) => {
        e.preventDefault();
        if (!formModalData.student || !formModalData.mssv || !formModalData.name || !formModalData.date) {
            showCustomToast("Vui lòng điền đầy đủ thông tin.", "error");
            return;
        }
        if (isAddingNewForm && studentSearchError) {
            showCustomToast("Vui lòng kiểm tra lại Mã số sinh viên.", "error");
            return;
        }
        const selectedFormFolder = availableFormNames.find(folder => folder.name === formModalData.name);
        if (!selectedFormFolder) {
            showCustomToast("Tên biểu mẫu không hợp lệ.", "error");
            return;
        }
        if (isAddingNewForm) {
            try {
                const newFormFromApi = await RequestStudentService.create(
                    formModalData.mssv,
                    selectedFormFolder.id,
                    formModalData.status
                );
                const formattedNewForm = {
                    id: newFormFromApi.id,
                    student: newFormFromApi.student_name ?? formModalData.student,
                    mssv: newFormFromApi.student_code,
                    name: newFormFromApi.folder_name ?? formModalData.name,
                    date: new Date(newFormFromApi.created_at).toLocaleDateString("vi-VN"),
                    updatedDate: new Date(newFormFromApi.updated_at).toLocaleDateString("vi-VN"),
                    status: newFormFromApi.status ?? formModalData.status,
                };
                const updatedForms = [...originalForms, formattedNewForm];
                setStagedForms(updatedForms);
                setOriginalForms(updatedForms);
                setShowAddEditFormModal(false);
                showCustomToast("Đã thêm biểu mẫu mới thành công!", "success");
                const newStatus = formattedNewForm.status;
                if (newStatus === "Đang chờ duyệt" || newStatus === "Đã duyệt") {
                    const title = newStatus === "Đang chờ duyệt" ? "Thông báo nộp biểu mẫu thành công" : "Thông báo duyệt biểu mẫu";
                    const message = newStatus === "Đang chờ duyệt" ?
                        `Biểu mẫu "${formattedNewForm.name}" của bạn đã được nộp thành công và đang chờ duyệt.` :
                        `Biểu mẫu "${formattedNewForm.name}" của bạn đã được duyệt.`;
                    sendEmailNotification({
                        student_codes: [formattedNewForm.mssv],
                        title: title,
                        message: message
                    });
                } else if (newStatus === "Bổ sung" || newStatus === "Đã hủy") {
                    setNotification({
                        recipient: `${formattedNewForm.student} (${formattedNewForm.mssv})`,
                        student_codes_array: [formattedNewForm.mssv],
                        title: newStatus === "Bổ sung" ? "Yêu cầu bổ sung thông tin biểu mẫu" : "Thông báo hủy biểu mẫu",
                        content: ''
                    });
                    setCurrentFormForNotification(null);
                    setShowNotificationModal(true);
                }
            } catch (error) {
                console.error("Lỗi khi thêm biểu mẫu mới:", error);
                showCustomToast("Lỗi khi thêm biểu mẫu mới. Vui lòng thử lại.", "error");
            }
        } else {
            try {
                const dateToSave = convertToDisplayDate(formModalData.date);
                const updatedData = {
                    student_code: formModalData.mssv,
                    folder_id: selectedFormFolder.id,
                    status: formModalData.status,
                };
                // API response from update should ideally return the full updated object
                const updatedFormFromApi = await RequestStudentService.update(formBeingEdited.id, updatedData);
                const updatedForms = stagedForms.map(form =>
                    form.id === formBeingEdited.id ? {
                        ...form,
                        ...formModalData,
                        date: dateToSave,
                        name: selectedFormFolder.name,
                        // Update the updatedDate from the API response
                        updatedDate: convertToDisplayDate(formModalData.updated_at)
                    } : form
                );
                setStagedForms(updatedForms);
                setOriginalForms(updatedForms);
                setHasPendingChanges(false);
                setShowAddEditFormModal(false);
                showCustomToast("Đã cập nhật biểu mẫu thành công!", "success");
                const originalForm = originalForms.find(f => f.id === formBeingEdited.id);
                if (originalForm && originalForm.status !== formModalData.status) {
                    if (formModalData.status === "Đã duyệt" || formModalData.status === "Đang chờ duyệt") {
                        const title = formModalData.status === "Đã duyệt" ? "Thông báo duyệt biểu mẫu" : "Thông báo cập nhật trạng thái biểu mẫu";
                        const message = formModalData.status === "Đã duyệt" ?
                            `Biểu mẫu "${formModalData.name}" của bạn đã được duyệt. Vui lòng kiểm tra hệ thống để biết thêm chi tiết.` :
                            `Biểu mẫu "${formModalData.name}" của bạn đã được cập nhật sang trạng thái "Đang chờ duyệt".`;
                        sendEmailNotification({
                            student_codes: [formModalData.mssv],
                            title: title,
                            message: message
                        });
                    } else if (formModalData.status === "Bổ sung" || formModalData.status === "Đã hủy") {
                        setNotification({
                            recipient: `${formModalData.student} (${formModalData.mssv})`,
                            student_codes_array: [formModalData.mssv],
                            title: formModalData.status === "Bổ sung" ? "Yêu cầu bổ sung thông tin biểu mẫu" : "Thông báo hủy biểu mẫu",
                            content: ''
                        });
                        setCurrentFormForNotification(null);
                        setShowNotificationModal(true);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi cập nhật biểu mẫu:", error);
                showCustomToast("Lỗi khi cập nhật biểu mẫu. Vui lòng thử lại.", "error");
            }
        }
    };

    const handleDeleteForm = async (formId) => {
        setConfirmationConfig({
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc chắn muốn xóa biểu mẫu này không? Thao tác này sẽ xóa vĩnh viễn khỏi hệ thống.',
            onConfirm: async () => {
                try {
                    await RequestStudentService.remove(formId);
                    const updatedForms = stagedForms.filter(form => form.id !== formId);
                    setStagedForms(updatedForms);
                    setOriginalForms(updatedForms);
                    setHasPendingChanges(false);
                    showCustomToast("Đã xóa biểu mẫu thành công!", "success");
                    setShowConfirmationModal(false);
                } catch (error) {
                    console.error("Lỗi khi xóa biểu mẫu:", error);
                    showCustomToast("Lỗi khi xóa biểu mẫu. Vui lòng thử lại.", "error");
                    setShowConfirmationModal(false);
                }
            }
        });
        setShowConfirmationModal(true);
    };

    const getToastClasses = (type) => {
        switch (type) {
            case 'success':
                return { bg: 'bg-green-500', icon: <CheckCircleIcon className="h-6 w-6 text-white" /> };
            case 'error':
                return { bg: 'bg-red-500', icon: <ExclamationCircleIcon className="h-6 w-6 text-white" /> };
            case 'warning':
                return { bg: 'bg-orange-500', icon: <ExclamationCircleIcon className="h-6 w-6 text-white" /> };
            default:
                return { bg: 'bg-blue-500', icon: <InformationCircleIcon className="h-6 w-6 text-white" /> };
        }
    };

    const { bg: toastBgClass, icon: toastIcon } = getToastClasses(toastType);
    const handleQuickSubmit = async (dataToSubmit) => {
        console.log("Dữ liệu nhận được để thêm nhanh:", dataToSubmit);
        showCustomToast(`Đang xử lý thêm ${dataToSubmit.length} yêu cầu...`, "info");
        setShowQuickAddModal(false);
        try {
            const createPromises = dataToSubmit.map(item =>
                RequestStudentService.create(item.student_code, item.idfolder, 'Đang chờ duyệt')
            );
            const newFormsFromApi = await Promise.all(createPromises);
            const formattedNewForms = newFormsFromApi.map(item => ({
                id: item.id,
                student: item.student_name ?? "N/A",
                mssv: item.student_code,
                name: item.folder_name,
                date: new Date(item.created_at).toLocaleDateString("vi-VN"),
                updatedDate: new Date(item.updated_at).toLocaleDateString("vi-VN"),
                status: item.status ?? "Đang chờ duyệt"
            }));
            const updatedForms = [...originalForms, ...formattedNewForms];
            setOriginalForms(updatedForms);
            setStagedForms(updatedForms);
            showCustomToast(`Đã thêm thành công ${newFormsFromApi.length} yêu cầu mới!`, "success");
            formattedNewForms.forEach(form => {
                sendEmailNotification({
                    student_codes: [form.mssv],
                    title: "Thông báo nộp biểu mẫu thành công",
                    message: `Biểu mẫu "${form.name}" của bạn đã được nộp thành công và đang chờ duyệt.`
                });
            });
        } catch (error) {
            console.error("Lỗi khi thực hiện thêm nhanh:", error);
            showCustomToast("Đã xảy ra lỗi trong quá trình thêm nhanh. Vui lòng thử lại.", "error");
        }
    };
    const handleCloseQuickAddModal = () => {
        setShowQuickAddModal(false);
    };
    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
            {showToast && (
                <div className={`fixed top-5 right-5 z-[100] flex items-center p-4 rounded-lg shadow-2xl text-white ${toastBgClass} transform transition-all duration-300 ease-in-out`}>
                    <div className="flex-shrink-0">{toastIcon}</div>
                    <div className="ml-3 text-sm font-medium">{toastMessage}</div>
                    <button onClick={() => setShowToast(false)} className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-white rounded-lg p-1.5 hover:bg-white/20 inline-flex h-8 w-8 items-center justify-center">
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            )}
            <div className="max-w-full mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 mb-4 md:mb-0">
                        Quản lý Yêu cầu Sinh viên
                    </h1>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowQuickAddModal(true)}
                            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                            <PlusCircleIcon className="h-5 w-5" />
                            Thêm Nhanh
                        </button>
                        <button
                            onClick={handleOpenAddFormModal}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                            <PencilIcon className="h-5 w-5" />
                            Thêm Thủ công
                        </button>
                    </div>
                </div>
                <div className="mb-6 space-y-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên sinh viên, MSSV, hoặc tên biểu mẫu..."
                        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            className="p-3 border border-gray-300 rounded-lg w-full cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-900"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="Tất cả">Tất cả trạng thái</option>
                            <option value="Đang chờ duyệt">Đang chờ duyệt</option>
                            <option value="Bổ sung">Bổ sung</option>
                            <option value="Đã duyệt">Đã duyệt</option>
                            <option value="Đã hủy">Đã hủy</option>
                        </select>
                        <select
                            className="p-3 border border-gray-300 rounded-lg w-full cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white text-gray-900"
                            value={filterFormName}
                            onChange={(e) => setFilterFormName(e.target.value)}
                        >
                            <option value="Tất cả">Tất cả biểu mẫu</option>
                            {availableFormNames.map(form => (
                                <option key={form.id} value={form.name}>{form.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {selectedFormIds.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="text-md font-semibold text-blue-800 mb-3">Thao tác hàng loạt cho {selectedFormIds.length} mục đã chọn:</h3>
                        <div className="flex flex-wrap gap-3">
                            <button onClick={() => handleBulkUpdateStatus("Đang chờ duyệt")} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition">Chờ Duyệt</button>
                            <button onClick={() => handleBulkUpdateStatus("Bổ sung")} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition">Bổ Sung</button>
                            <button onClick={() => handleBulkUpdateStatus("Đã duyệt")} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition">Đã Duyệt</button>
                            <button onClick={() => handleBulkUpdateStatus("Đã hủy")} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition">Đã Hủy</button>
                            <button onClick={handleOpenNotificationModalForSelected} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition flex items-center gap-2"><BellAlertIcon className="h-5 w-5" />Gửi Thông báo</button>
                        </div>
                    </div>
                )}
                {hasPendingChanges && (
                    <div className="my-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg flex items-center justify-between shadow-sm">
                        <p className="font-medium">Bạn có những thay đổi chưa được lưu.</p>
                        <div className="flex gap-4">
                            <button onClick={handleSaveAllChanges} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition">Lưu Thay đổi</button>
                            <button onClick={handleDiscardChanges} className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-md transition">Hủy bỏ</button>
                        </div>
                    </div>
                )}
                <Table
                    headers={["ID đơn", "Tên sinh viên", "MSSV", "Tên biểu mẫu", "Ngày nộp", "Ngày cập nhật", "Trạng thái", "Hành động"]}
                    data={filteredForms}
                    onUpdateStatus={handleUpdateSingleFormStatus}
                    selectable={true}
                    selectedItems={selectedFormIds}
                    onSelectItem={handleSelectForm}
                    onSelectAllItems={handleSelectAllForms}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    onEdit={handleOpenEditFormModal}
                    onDelete={handleDeleteForm}
                />
                {showNotificationModal && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                            <button onClick={() => setShowNotificationModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"><XMarkIcon className="h-6 w-6" /></button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Gửi thông báo</h2>
                            <form onSubmit={handleSubmitNotification} className="space-y-4">
                                <div>
                                    <label htmlFor="modal-recipient" className="block text-sm font-medium text-gray-700 mb-1">Gửi đến (MSSV)</label>
                                    <input id="modal-recipient" type="text" value={notification.recipient} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" readOnly />
                                </div>
                                <div>
                                    <label htmlFor="modal-title" className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề email</label>
                                    <input id="modal-title" type="text" value={notification.title} onChange={(e) => setNotification({ ...notification, title: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" placeholder="Nhập tiêu đề email" required />
                                </div>
                                <div>
                                    <label htmlFor="modal-content" className="block text-sm font-medium text-gray-700 mb-1">Nội dung thông báo</label>
                                    <textarea id="modal-content" value={notification.content} onChange={(e) => setNotification({ ...notification, content: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" rows="6" placeholder="Nhập nội dung thông báo" required />
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setShowNotificationModal(false)} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg hover:bg-gray-300 transition shadow-sm font-medium">Hủy</button>
                                    <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium">Gửi thông báo</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {showConfirmationModal && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative text-center transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{confirmationConfig.title}</h2>
                            <p className="text-gray-600 mb-8 text-base">
                                {confirmationConfig.message}
                            </p>
                            <div className="flex justify-center gap-4">
                                <button type="button" onClick={() => setShowConfirmationModal(false)} className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition shadow-sm font-medium">Hủy</button>
                                <button type="button" onClick={confirmationConfig.onConfirm} className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition shadow-sm font-medium">Đồng ý</button>
                            </div>
                        </div>
                    </div>
                )}
                {showAddEditFormModal && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                            <button onClick={() => setShowAddEditFormModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"><XMarkIcon className="h-6 w-6" /></button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isAddingNewForm ? 'Thêm Yêu cầu Mới' : 'Chỉnh sửa Yêu cầu'}</h2>
                            <form onSubmit={handleSubmitAddEditForm} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Thông tin Sinh viên</h3>
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="mssv" className="block text-sm font-medium leading-6 text-gray-900">Mã số sinh viên (MSSV)</label>
                                            <div className="mt-2">
                                                <input type="text" id="mssv" name="mssv" value={formModalData.mssv} onChange={handleFormModalChange} onBlur={(e) => e.target.value.trim() && searchStudentByMssv(e.target.value.trim())} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900" placeholder="Nhập MSSV và chờ tự động điền tên" required />
                                                {isStudentSearching && <p className="text-blue-600 text-xs mt-1">Đang tìm kiếm...</p>}
                                                {studentSearchError && <p className="text-red-600 text-xs mt-1">{studentSearchError}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="student" className="block text-sm font-medium leading-6 text-gray-900">Tên sinh viên</label>
                                            <div className="mt-2">
                                                <input type="text" id="student" name="student" value={formModalData.student} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-900" readOnly required />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-2">Thông tin Yêu cầu</h3>
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Tên biểu mẫu</label>
                                            <div className="mt-2">
                                                <select id="name" name="name" value={formModalData.name} onChange={handleFormModalChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-gray-900" required>
                                                    {availableFormNames.map(form => (
                                                        <option key={form.id} value={form.name}>{form.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">Ngày nộp</label>
                                            <div className="mt-2">
                                                <input type="date" id="date" name="date" value={formModalData.date} onChange={handleFormModalChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">Trạng thái</label>
                                            <div className="mt-2">
                                                <select id="status" name="status" value={formModalData.status} onChange={handleFormModalChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-gray-900" required>
                                                    <option value="Đang chờ duyệt">Đang chờ duyệt</option>
                                                    <option value="Bổ sung">Bổ sung</option>
                                                    <option value="Đã duyệt">Đã duyệt</option>
                                                    <option value="Đã hủy">Đã hủy</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" onClick={() => setShowAddEditFormModal(false)} className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition shadow-sm font-medium">Hủy</button>
                                    <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm font-medium flex items-center gap-2">
                                        <CheckCircleIcon className="h-5 w-5" />
                                        {isAddingNewForm ? 'Thêm mới' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
                        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                            <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thành công!</h2>
                            <p className="text-gray-600 mb-8 text-lg">{successModalMessage}</p>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition shadow-sm font-medium"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <QuickAddFormRequest
                show={showQuickAddModal}
                onClose={handleCloseQuickAddModal}
                onSubmit={handleQuickSubmit}
                folders={availableFormNames}
            />
        </div>
    );
}

export default FormRequest;

const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in-scale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-fade-in-scale {
    animation: fade-in-scale 0.3s ease-out forwards;
  }
`;
document.head.appendChild(style);