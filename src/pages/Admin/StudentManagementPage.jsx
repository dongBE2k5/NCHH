import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, PlusCircleIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

function StudentManagementPage() {
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for Add/Edit Modal
    const [showAddEditModal, setShowAddEditModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // true for edit, false for add
    const [currentStudent, setCurrentStudent] = useState({
        id: null,
        name: '',
        student_code: '',
        email: ''
    });

    // State for Toast Notification
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('info'); // 'success', 'error', 'info', 'warning'

    // Function to show custom toast notification
    const showCustomToast = (message, type = 'info') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            setToastMessage('');
            setToastType('info');
        }, 4000); // Hide after 4 seconds
    };

    // Fetch students from API
    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get('http://localhost:8000/api/student');
                setStudents(response.data);
            } catch (err) {
                console.error("Error fetching students:", err);
                setError("Lỗi khi tải danh sách sinh viên. Vui lòng thử lại.");
                showCustomToast("Lỗi khi tải danh sách sinh viên!", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []); // Empty dependency array means this runs once on mount

    // Handle input changes in the modal form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentStudent(prev => ({ ...prev, [name]: value }));
    };

    // Open Add Student modal
    const handleAddStudentClick = () => {
        setIsEditing(false);
        setCurrentStudent({ id: null, name: '', student_code: '', email: '' });
        setShowAddEditModal(true);
    };

    // Open Edit Student modal
    const handleEditStudentClick = (student) => {
        setIsEditing(true);
        setCurrentStudent({ ...student }); // Copy student data to currentStudent state
        setShowAddEditModal(true);
    };

    // Handle form submission for Add/Edit
    const handleSubmitAddEditForm = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Basic validation
        if (!currentStudent.name || !currentStudent.student_code || !currentStudent.email) {
            setError("Vui lòng điền đầy đủ thông tin.");
            showCustomToast("Vui lòng điền đầy đủ thông tin.", "warning");
            setIsLoading(false);
            return;
        }

        try {
            if (isEditing) {
                // Update existing student
                const response = await axios.put(`http://localhost:8000/api/student/${currentStudent.id}`, currentStudent);
                setStudents(students.map(s => s.id === currentStudent.id ? response.data : s));
                showCustomToast("Cập nhật sinh viên thành công!", "success");
            } else {
                // Add new student
                const response = await axios.post('http://localhost:8000/api/student', currentStudent);
                setStudents([...students, response.data]);
                showCustomToast("Thêm sinh viên mới thành công!", "success");
            }
            setShowAddEditModal(false); // Close modal on success
        } catch (err) {
            console.error("Error saving student:", err);
            setError(err.response?.data?.message || "Lỗi khi lưu sinh viên. Vui lòng thử lại.");
            showCustomToast("Lỗi khi lưu sinh viên!", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Delete Student
    const handleDeleteStudent = async (studentId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này không?")) {
            setIsLoading(true);
            setError(null);
            try {
                await axios.delete(`http://localhost:8000/api/student/${studentId}`);
                setStudents(students.filter(s => s.id !== studentId));
                showCustomToast("Xóa sinh viên thành công!", "success");
            } catch (err) {
                console.error("Error deleting student:", err);
                setError(err.response?.data?.message || "Lỗi khi xóa sinh viên. Vui lòng thử lại.");
                showCustomToast("Lỗi khi xóa sinh viên!", "error");
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Helper function to get Tailwind CSS classes and icon for toast
    const getToastClasses = (type) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-500',
                    icon: <CheckCircleIcon className="h-6 w-6 text-white" />
                };
            case 'error':
                return {
                    bg: 'bg-red-500',
                    icon: <ExclamationCircleIcon className="h-6 w-6 text-white" />
                };
            case 'warning':
                return {
                    bg: 'bg-orange-500',
                    icon: <ExclamationCircleIcon className="h-6 w-6 text-white" />
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-500',
                    icon: <InformationCircleIcon className="h-6 w-6 text-white" />
                };
        }
    };

    const { bg: toastBgClass, icon: toastIcon } = getToastClasses(toastType);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
            {/* Custom Toast Notification */}
            {showToast && (
                <div className={`fixed top-4 right-4 z-[100] flex items-center p-4 rounded-lg shadow-lg text-white ${toastBgClass} transition-all duration-300 ease-out transform translate-x-0 opacity-100`}>
                    <div className="flex-shrink-0">
                        {toastIcon}
                    </div>
                    <div className="ml-3 text-sm font-medium">
                        {toastMessage}
                    </div>
                    <button
                        onClick={() => setShowToast(false)}
                        className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-white rounded-lg p-1.5 hover:bg-opacity-20 inline-flex h-8 w-8"
                        aria-label="Close"
                    >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            )}

            <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8 text-center">Quản lý Sinh viên</h1>

                <div className="mb-6 flex justify-end">
                    <button
                        onClick={handleAddStudentClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-lg font-medium shadow-md transition duration-200 ease-in-out transform hover:scale-105 flex items-center"
                    >
                        <PlusCircleIcon className="h-6 w-6 mr-2" /> Thêm sinh viên mới
                    </button>
                </div>

                {isLoading && (
                    <div className="text-center py-4">
                        <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600 mt-2">Đang tải dữ liệu...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="text-center text-red-600 text-lg mb-6 p-2 bg-red-100 rounded-md">
                        {error}
                    </div>
                )}

                {!isLoading && students.length === 0 && !error && (
                    <div className="text-center text-gray-600 text-lg mb-6 p-4 bg-blue-50 rounded-md">
                        Chưa có sinh viên nào trong hệ thống.
                    </div>
                )}

                {!isLoading && students.length > 0 && (
                    <div className="overflow-x-auto rounded-lg shadow-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-sky-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên sinh viên</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mã số sinh viên</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{student.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{student.student_code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{student.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button
                                                onClick={() => handleEditStudentClick(student)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4 p-2 rounded-md hover:bg-indigo-100 transition duration-150"
                                                title="Chỉnh sửa"
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-100 transition duration-150"
                                                title="Xóa"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Student Modal */}
            {showAddEditModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setShowAddEditModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                            {isEditing ? 'Chỉnh sửa Sinh viên' : 'Thêm Sinh viên mới'}
                        </h2>
                        <form onSubmit={handleSubmitAddEditForm}>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Tên sinh viên</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={currentStudent.name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="student_code" className="block text-gray-700 font-medium mb-1">Mã số sinh viên</label>
                                <input
                                    type="text"
                                    id="student_code"
                                    name="student_code"
                                    value={currentStudent.student_code}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    placeholder="VD: 20510001"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={currentStudent.email}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>
                            {error && !isLoading && ( // Display modal-specific error
                                <p className="text-red-600 text-center mb-4 text-sm">{error}</p>
                            )}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddEditModal(false)}
                                    className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out shadow-md font-medium text-lg"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out shadow-md font-medium text-lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        isEditing ? 'Lưu thay đổi' : 'Thêm mới'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StudentManagementPage;
