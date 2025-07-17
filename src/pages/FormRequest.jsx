import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL } from '../service/BaseUrl';
function FormRequest() {
  // ... (tất cả các state đã có)
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

  // *** THÊM MỚI: State cho modal thông báo thành công ***
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');


  // ... (tất cả các hàm không thay đổi: useEffect, convertToInputDate, etc.)
  useEffect(() => {
    axios.get(`${API_BASE_URL}/folder`)
      .then(res => {
        const folderNames = res.data.map(folder => ({
          id: folder.id,
          name: folder.name
        }));

        setAvailableFormNames(folderNames);
      })
      .catch(err => {
        console.error('Lỗi khi tải folder từ API:', err);
      });
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
      await axios.post(`${API_BASE_URL}/send-email-student`, {
        title,
        message,
        student_codes,
      });
      // Email tự động sẽ vẫn dùng toast cho đỡ phiền
      showCustomToast(`Đã gửi email tự động đến: ${student_codes.join(', ')}`, "success");
    } catch (error) {
      console.error("Lỗi khi gửi email:", error);
      showCustomToast(`Lỗi khi gửi email đến: ${student_codes.join(', ')}`, "error");
    }
  };


  useEffect(() => {
    axios.get(`${API_BASE_URL}/request-students`)
      .then(res => {
        const formatted = res.data.map(item => ({
          id: item.id,
          student: item.student_name ?? "N/A",
          mssv: item.student_code,
          name: item.folder_name,
          date: new Date(item.created_at).toLocaleDateString("vi-VN"),
          status: item.status ?? "Đang chờ duyệt"
        }));
        setOriginalForms(formatted);
        setStagedForms(formatted);
      })
      .catch(err => {
        console.error("Lỗi khi tải dữ liệu từ API /request-students", err);
      });
  }, []);


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

        if (sortColumn === 'date') {
          const parseDate = (dateString) => {
            const [day, month, year] = dateString.split('/').map(Number);
            return new Date(year, month - 1, day);
          };
          valA = parseDate(a.date);
          valB = parseDate(b.date);
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
    setShowConfirmationModal(true);
  };

  const confirmBulkUpdate = async () => {
    const newStatus = statusToConfirm;
    if (!newStatus) return;

    setShowConfirmationModal(false);

    try {
      await axios.post(`${API_BASE_URL}/request-students/bulk-update-status`, {
        ids: selectedFormIds,
        status: newStatus
      });

      showCustomToast("Đã cập nhật trạng thái thành công!", "success");

      const updatedForms = stagedForms.map(form =>
        selectedFormIds.includes(form.id) ? { ...form, status: newStatus } : form
      );
      setStagedForms(updatedForms);
      setOriginalForms(updatedForms);
      
      const formsToNotify = updatedForms.filter(form => selectedFormIds.includes(form.id));

      if (newStatus === "Đã duyệt") {
        formsToNotify.forEach(form => {
           sendEmailNotification({
             student_codes: [form.mssv],
             title: "Thông báo duyệt biểu mẫu",
             message: `Biểu mẫu "${form.name}" của bạn đã được duyệt. Vui lòng kiểm tra hệ thống để biết thêm chi tiết.`
           });
        });
      }
      else if (newStatus === "Bổ sung" || newStatus === "Đã hủy") {
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
  
  // *** CẬP NHẬT: Thay thế toast bằng modal thành công ***
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
        const response = await axios.post(`${API_BASE_URL}/send-email-student`, {
        title: notification.title,
        message: notification.content,
        student_codes: finalStudentCodes,
      });
      console.log(response);
      
      if (response.data.success) {
        // 1. Đóng form gửi thông báo và reset state
        setShowNotificationModal(false);
        setNotification({ recipient: '', title: '', content: '', student_codes_array: [] });
        setCurrentFormForNotification(null);
        
        // 2. Chuẩn bị và hiển thị modal thành công
        setSuccessModalMessage(`Thông báo đã được gửi thành công đến ${finalStudentCodes.length} sinh viên.`);
        setShowSuccessModal(true);

      } else {
        showCustomToast(response.data.message || "Lỗi khi gửi thông báo!", "error");
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
        axios.put(`${API_BASE_URL}/request-students/${form.id}`, { status: form.status })
      );
      await Promise.all(updatePromises);
      
      const manualNotifyForms = [];
      
      formsToUpdate.forEach(form => {
        if (form.status === "Đang chờ duyệt" || form.status === "Đã duyệt") {
          const title = form.status === "Đang chờ duyệt" ? "Thông báo nộp biểu mẫu thành công" : "Thông báo duyệt biểu mẫu";
          const message = form.status === "Đang chờ duyệt" ? `Biểu mẫu "${form.name}" đã được gửi và đang chờ duyệt.` : `Biểu mẫu "${form.name}" của bạn đã được duyệt.`;
          sendEmailNotification({ student_codes: [form.mssv], title, message });
        }
        else if (form.status === "Bổ sung" || form.status === "Đã hủy") {
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
  
  // ... (tất cả các hàm còn lại không thay đổi)
  const handleDiscardChanges = () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy bỏ tất cả thay đổi chưa lưu không?")) {
      setStagedForms(originalForms);
      setHasPendingChanges(false);
      setSelectedFormIds([]);
      showCustomToast("Tất cả thay đổi chưa lưu đã được hủy bỏ.", "info");
    }
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
        const dataToSend = {
          student_code: formModalData.mssv,
          folder_id: selectedFormFolder.id,
          status: formModalData.status,
        };

        const response = await axios.post(`${API_BASE_URL}/request-students`, dataToSend);
        const newFormFromApi = response.data;

        const formattedNewForm = {
          id: newFormFromApi.id,
          student: newFormFromApi.student_name ?? formModalData.student,
          mssv: newFormFromApi.student_code,
          name: newFormFromApi.folder_name ?? formModalData.name,
          date: new Date(newFormFromApi.created_at).toLocaleDateString("vi-VN"),
          status: newFormFromApi.status ?? formModalData.status,
        };
        
        const updatedForms = [...originalForms, formattedNewForm];
        setStagedForms(updatedForms);
        setOriginalForms(updatedForms);
        setShowAddEditFormModal(false);
        showCustomToast("Đã thêm biểu mẫu mới thành công!", "success");

        if (formattedNewForm.status === "Đang chờ duyệt") {
           sendEmailNotification({
             student_codes: [formattedNewForm.mssv],
             title: "Thông báo nộp biểu mẫu thành công",
             message: `Biểu mẫu "${formattedNewForm.name}" của bạn đã được nộp thành công và đang chờ duyệt.`
           });
        }
      } catch (error) {
        console.error("Lỗi khi thêm biểu mẫu mới:", error);
        showCustomToast("Lỗi khi thêm biểu mẫu mới. Vui lòng thử lại.", "error");
      }
    } else {
      const dateToSave = convertToDisplayDate(formModalData.date);
      const updatedForms = stagedForms.map(form =>
        form.id === formBeingEdited.id ? { ...form, ...formModalData, date: dateToSave, folder_id: selectedFormFolder.id } : form
      );
      setStagedForms(updatedForms);
      setHasPendingChanges(true);
      setShowAddEditFormModal(false);
      showCustomToast("Đã cập nhật. Nhấn 'Lưu thay đổi' để xác nhận.", "info");
    }
  };


  const handleDeleteForm = (formId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa biểu mẫu này không? Thao tác này cần được 'Lưu thay đổi' để xác nhận.")) {
      const updatedForms = stagedForms.filter(form => form.id !== formId);
      setStagedForms(updatedForms);
      setHasPendingChanges(true);
      showCustomToast("Đã xóa biểu mẫu. Nhấn 'Lưu thay đổi' để xác nhận.", "info");
    }
  };

  const getToastClasses = (type) => {
    switch (type) {
      case 'success': return { bg: 'bg-green-500', icon: <CheckCircleIcon className="h-6 w-6 text-white" /> };
      case 'error': return { bg: 'bg-red-500', icon: <ExclamationCircleIcon className="h-6 w-6 text-white" /> };
      case 'warning': return { bg: 'bg-orange-500', icon: <ExclamationCircleIcon className="h-6 w-6 text-white" /> };
      default: return { bg: 'bg-blue-500', icon: <InformationCircleIcon className="h-6 w-6 text-white" /> };
    }
  };

  const { bg: toastBgClass, icon: toastIcon } = getToastClasses(toastType);


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* ... (JSX for Toast Notification) */}
       {showToast && (
        <div className={`fixed top-4 right-4 z-[100] flex items-center p-4 rounded-lg shadow-lg text-white ${toastBgClass} transition-all duration-300`}>
          <div className="flex-shrink-0">{toastIcon}</div>
          <div className="ml-3 text-sm font-medium">{toastMessage}</div>
          <button onClick={() => setShowToast(false)} className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-white rounded-lg p-1.5 hover:bg-opacity-20 inline-flex h-8 w-8">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="max-w-full mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-xl">
        {/* ... (JSX for Heading, Filters, Buttons) */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8 text-center">Quản lý đơn đã nộp của sinh viên</h1>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm sinh viên, MSSV, biểu mẫu..."
            className="p-3 border border-gray-300 rounded-lg w-full focus:ring-blue-500 focus:border-blue-500 text-lg sm:col-span-3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-3 border border-gray-300 rounded-lg w-full text-lg cursor-pointer focus:ring-blue-500 focus:border-blue-500"
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
            className="p-3 border border-gray-300 rounded-lg w-full text-lg cursor-pointer focus:ring-blue-500 focus:border-blue-500"
            value={filterFormName}
            onChange={(e) => setFilterFormName(e.target.value)}
          >
            <option value="Tất cả">Tất cả biểu mẫu</option>
            {availableFormNames.map(form => (
              <option key={form.id} value={form.name}>{form.name}</option>
            ))}
          </select>
          <div className="flex justify-end sm:col-start-3">
             <button
                onClick={handleOpenAddFormModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-lg font-medium shadow-md transition duration-200 ease-in-out transform hover:scale-105 flex items-center"
              >
                <PlusCircleIcon className="h-6 w-6 mr-2" /> Thêm biểu mẫu
              </button>
          </div>
        </div>

        {selectedFormIds.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Thao tác hàng loạt cho {selectedFormIds.length} mục đã chọn:</h3>
            <div className="flex flex-wrap gap-3">
                <button onClick={() => handleBulkUpdateStatus("Đang chờ duyệt")} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-base font-medium shadow-md transition">Chờ Duyệt</button>
                <button onClick={() => handleBulkUpdateStatus("Bổ sung")} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-base font-medium shadow-md transition">Bổ Sung</button>
                <button onClick={() => handleBulkUpdateStatus("Đã duyệt")} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-base font-medium shadow-md transition">Đã Duyệt</button>
                <button onClick={() => handleBulkUpdateStatus("Đã hủy")} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-base font-medium shadow-md transition">Đã Hủy</button>
                <button onClick={handleOpenNotificationModalForSelected} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-base font-medium shadow-md transition">Gửi Thông báo</button>
            </div>
          </div>
        )}

        {hasPendingChanges && (
          <div className="my-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg flex items-center justify-between">
            <p className="font-medium">Bạn có những thay đổi chưa được lưu.</p>
            <div className="flex gap-4">
              <button onClick={handleSaveAllChanges} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-base font-medium shadow-md transition">Lưu Thay đổi</button>
              <button onClick={handleDiscardChanges} className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-lg text-base font-medium shadow-md transition">Hủy bỏ</button>
            </div>
          </div>
        )}

        <Table
          headers={["ID đơn", "Tên sinh viên", "MSSV", "Tên biểu mẫu", "Ngày nộp", "Trạng thái", "Hành động"]}
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
        
        {/* ... (JSX for Notification Modal, Confirmation Modal, Add/Edit Modal) */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
              <button onClick={() => setShowNotificationModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6" /></button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Gửi thông báo</h2>
              <form onSubmit={handleSubmitNotification}>
                <div className="mb-4">
                  <label htmlFor="modal-recipient" className="block text-gray-700 font-medium mb-1">Gửi đến (MSSV)</label>
                  <input id="modal-recipient" type="text" value={notification.recipient} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-lg" readOnly />
                </div>
                <div className="mb-4">
                    <label htmlFor="modal-title" className="block text-gray-700 font-medium mb-1">Tiêu đề email</label>
                    <input id="modal-title" type="text" value={notification.title} onChange={(e) => setNotification({ ...notification, title: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg" placeholder="Nhập tiêu đề email" required />
                </div>
                <div className="mb-6">
                  <label htmlFor="modal-content" className="block text-gray-700 font-medium mb-1">Nội dung thông báo</label>
                  <textarea id="modal-content" value={notification.content} onChange={(e) => setNotification({ ...notification, content: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg" rows="6" placeholder="Nhập nội dung thông báo" required />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowNotificationModal(false)} className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition shadow-md font-medium text-lg">Hủy</button>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-medium text-lg">Gửi thông báo</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showConfirmationModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm relative text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Xác nhận cập nhật</h2>
              <p className="text-gray-700 mb-6 text-lg">
                Bạn chắc chắn muốn cập nhật <strong>{selectedFormIds.length}</strong> mục đã chọn sang trạng thái <strong className="text-blue-600">"{statusToConfirm}"</strong> không?
              </p>
              <div className="flex justify-center gap-4">
                <button type="button" onClick={() => setShowConfirmationModal(false)} className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition shadow-md font-medium text-lg">Hủy</button>
                <button type="button" onClick={confirmBulkUpdate} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-md font-medium text-lg">Đồng ý</button>
              </div>
            </div>
          </div>
        )}

        {showAddEditFormModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
              <button onClick={() => setShowAddEditFormModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"><XMarkIcon className="h-6 w-6" /></button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{isAddingNewForm ? 'Thêm biểu mẫu mới' : 'Chỉnh sửa biểu mẫu'}</h2>
              <form onSubmit={handleSubmitAddEditForm}>
                <div className="mb-4">
                  <label htmlFor="mssv" className="block text-gray-700 font-medium mb-1">Mã số sinh viên (MSSV)</label>
                  <input type="text" id="mssv" name="mssv" value={formModalData.mssv} onChange={handleFormModalChange} onBlur={(e) => e.target.value.trim() && searchStudentByMssv(e.target.value.trim())} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg" placeholder="VD: 20510001" required />
                  {isStudentSearching && <p className="text-blue-500 text-sm mt-1">Đang tìm kiếm...</p>}
                  {studentSearchError && <p className="text-red-500 text-sm mt-1">{studentSearchError}</p>}
                </div>
                <div className="mb-4">
                  <label htmlFor="student" className="block text-gray-700 font-medium mb-1">Tên sinh viên</label>
                  <input type="text" id="student" name="student" value={formModalData.student} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-lg" placeholder="Tên sẽ tự động điền" readOnly required />
                </div>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Tên biểu mẫu</label>
                  <select id="name" name="name" value={formModalData.name} onChange={handleFormModalChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg" required>
                    {availableFormNames.map((nameOption) => <option key={nameOption.id} value={nameOption.name}>{nameOption.name}</option>)}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="date" className="block text-gray-700 font-medium mb-1">Ngày nộp</label>
                  <input type="date" id="date" name="date" value={formModalData.date} onChange={handleFormModalChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg" required />
                </div>
                <div className="mb-6">
                  <label htmlFor="status" className="block text-gray-700 font-medium mb-1">Trạng thái</label>
                  <select id="status" name="status" value={formModalData.status} onChange={handleFormModalChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg">
                    <option value="Đang chờ duyệt">Đang chờ duyệt</option>
                    <option value="Bổ sung">Bổ sung</option>
                    <option value="Đã duyệt">Đã duyệt</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddEditFormModal(false)} className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition shadow-md font-medium text-lg">Hủy</button>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md font-medium text-lg">{isAddingNewForm ? 'Thêm mới' : 'Lưu thay đổi'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* *** THÊM MỚI: Modal thông báo hoàn tất *** */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm relative text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-5">
                 <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Hoàn tất</h2>
              <p className="text-gray-700 mb-8 text-lg">
                {successModalMessage}
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition duration-200 ease-in-out shadow-md font-medium text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default FormRequest;