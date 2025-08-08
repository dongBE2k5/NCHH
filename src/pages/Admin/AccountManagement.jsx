// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//     MagnifyingGlassIcon,
//     PlusIcon,
//     PencilIcon,
//     TrashIcon,
//     UserGroupIcon,
//     CheckCircleIcon,
//     XCircleIcon,
//     ArrowPathIcon,
//     ChevronLeftIcon,
//     ChevronRightIcon
// } from '@heroicons/react/24/outline';
// import Modal from './Modal'; // Giả định bạn có một component Modal

// /**
//  * Component Quản lý Tài khoản VIP Pro
//  * @returns {JSX.Element}
//  */
// const AccountManagement = () => {
//     // State cho danh sách người dùng VIP
//     const [vipUsers, setVipUsers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     // State cho tìm kiếm và lọc
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'

//     // State cho Modal thêm/chỉnh sửa
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingUser, setEditingUser] = useState(null); // null nếu thêm mới, user object nếu chỉnh sửa

//     // State cho phân trang
//     const [currentPage, setCurrentPage] = useState(1);
//     const [usersPerPage] = useState(10); // Số người dùng trên mỗi trang

//     // --- Giả lập API Calls ---
//     // Trong một ứng dụng thực, bạn sẽ thay thế các hàm này bằng các cuộc gọi API thực tế của mình.
//     const fetchVipUsers = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             // Giả lập độ trễ mạng
//             await new Promise(resolve => setTimeout(resolve, 800));
//             // Dữ liệu giả lập
//             const dummyUsers = [
//                 { id: 1, name: 'Nguyễn Văn A', email: 'vana@example.com', level: 'Diamond', status: 'active', startDate: '2023-01-15', endDate: '2024-01-15' },
//                 { id: 2, name: 'Trần Thị B', email: 'thib@example.com', level: 'Platinum', status: 'inactive', startDate: '2022-11-01', endDate: '2023-11-01' },
//                 { id: 3, name: 'Lê Văn C', email: 'vanc@example.com', level: 'Gold', status: 'active', startDate: '2023-03-20', endDate: '2024-03-20' },
//                 { id: 4, name: 'Phạm Thị D', email: 'thid@example.com', level: 'Diamond', status: 'active', startDate: '2024-02-10', endDate: '2025-02-10' },
//                 { id: 5, name: 'Hoàng Văn E', email: 'vane@example.com', level: 'Gold', status: 'active', startDate: '2023-07-01', endDate: '2024-07-01' },
//                 { id: 6, name: 'Đỗ Thị F', email: 'thif@example.com', level: 'Platinum', status: 'inactive', startDate: '2022-09-12', endDate: '2023-09-12' },
//                 { id: 7, name: 'Vũ Văn G', email: 'vang@example.com', level: 'Diamond', status: 'active', startDate: '2024-05-01', endDate: '2025-05-01' },
//                 { id: 8, name: 'Bùi Thị H', email: 'thih@example.com', level: 'Gold', status: 'active', startDate: '2023-04-25', endDate: '2024-04-25' },
//                 { id: 9, name: 'Trịnh Văn I', email: 'vani@example.com', level: 'Platinum', status: 'active', startDate: '2023-06-18', endDate: '2024-06-18' },
//                 { id: 10, name: 'Đặng Thị K', email: 'thik@example.com', level: 'Diamond', status: 'active', startDate: '2024-01-05', endDate: '2025-01-05' },
//                 { id: 11, name: 'Lý Văn L', email: 'vanl@example.com', level: 'Gold', status: 'inactive', startDate: '2022-08-01', endDate: '2023-08-01' },
//                 { id: 12, name: 'Cao Thị M', email: 'thim@example.com', level: 'Platinum', status: 'active', startDate: '2023-10-10', endDate: '2024-10-10' },
//             ];
//             setVipUsers(dummyUsers);
//         } catch (err) {
//             setError('Không thể tải dữ liệu người dùng VIP.');
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchVipUsers();
//     }, [fetchVipUsers]);

//     // Hàm thêm/cập nhật người dùng VIP
//     const handleSaveUser = useCallback(async (user) => {
//         setLoading(true);
//         setError(null);
//         try {
//             await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập API call
//             if (user.id) {
//                 // Cập nhật người dùng hiện có
//                 setVipUsers(prevUsers => prevUsers.map(u => u.id === user.id ? user : u));
//             } else {
//                 // Thêm người dùng mới
//                 const newUser = { ...user, id: vipUsers.length > 0 ? Math.max(...vipUsers.map(u => u.id)) + 1 : 1 };
//                 setVipUsers(prevUsers => [...prevUsers, newUser]);
//             }
//             setIsModalOpen(false);
//             setEditingUser(null);
//         } catch (err) {
//             setError('Lỗi khi lưu người dùng.');
//             console.error(err);
//         } finally {
//             setLoading(false);
//         }
//     }, [vipUsers.length]);

//     // Hàm xóa người dùng VIP
//     const handleDeleteUser = useCallback(async (userId) => {
//         if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
//             setLoading(true);
//             setError(null);
//             try {
//                 await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập API call
//                 setVipUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
//             } catch (err) {
//                 setError('Lỗi khi xóa người dùng.');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         }
//     }, []);

//     // --- Logic Lọc và Tìm kiếm ---
//     const filteredUsers = useMemo(() => {
//         return vipUsers.filter(user => {
//             const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                                   user.email.toLowerCase().includes(searchTerm.toLowerCase());
//             const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
//             return matchesSearch && matchesStatus;
//         });
//     }, [vipUsers, searchTerm, filterStatus]);

//     // --- Logic Phân trang ---
//     const indexOfLastUser = currentPage * usersPerPage;
//     const indexOfFirstUser = indexOfLastUser - usersPerPage;
//     const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
//     const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

//     const paginate = (pageNumber) => setCurrentPage(pageNumber);

//     const nextPage = () => {
//         if (currentPage < totalPages) {
//             setCurrentPage(prev => prev + 1);
//         }
//     };

//     const prevPage = () => {
//         if (currentPage > 1) {
//             setCurrentPage(prev => prev - 1);
//         }
//     };

//     // --- Render Component ---
//     return (
//         <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
//             <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
//                 <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
//                     <UserGroupIcon className="h-8 w-8 text-indigo-600 mr-3" />
//                     Quản Lý Tài Khoản VIP Pro
//                 </h1>

//                 {/* Thanh công cụ tìm kiếm và lọc */}
//                 <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
//                     <div className="relative flex-grow w-full sm:w-auto">
//                         <input
//                             type="text"
//                             placeholder="Tìm kiếm theo tên hoặc email..."
//                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
//                             value={searchTerm}
//                             onChange={(e) => {
//                                 setSearchTerm(e.target.value);
//                                 setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
//                             }}
//                         />
//                         <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                     </div>

//                     <select
//                         className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//                         value={filterStatus}
//                         onChange={(e) => {
//                             setFilterStatus(e.target.value);
//                             setCurrentPage(1); // Reset về trang 1 khi lọc
//                         }}
//                     >
//                         <option value="all">Tất cả trạng thái</option>
//                         <option value="active">Hoạt động</option>
//                         <option value="inactive">Không hoạt động</option>
//                     </select>

//                     <button
//                         onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
//                         className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md"
//                     >
//                         <PlusIcon className="h-5 w-5 mr-2" />
//                         Thêm người dùng VIP
//                     </button>
//                 </div>

//                 {/* Thông báo lỗi/tải */}
//                 {loading && (
//                     <div className="flex items-center justify-center py-8 text-indigo-600">
//                         <ArrowPathIcon className="h-6 w-6 animate-spin mr-2" />
//                         Đang tải dữ liệu...
//                     </div>
//                 )}
//                 {error && (
//                     <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
//                         <strong className="font-bold">Lỗi!</strong>
//                         <span className="block sm:inline"> {error}</span>
//                     </div>
//                 )}

//                 {/* Bảng danh sách người dùng */}
//                 {!loading && !error && (
//                     <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
//                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cấp độ</th>
//                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
//                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày bắt đầu</th>
//                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày kết thúc</th>
//                                     <th scope="col" className="relative px-6 py-3"><span className="sr-only">Hành động</span></th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {currentUsers.length > 0 ? (
//                                     currentUsers.map((user) => (
//                                         <tr key={user.id} className="hover:bg-gray-50">
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.level}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                                 <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                                     user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//                                                 }`}>
//                                                     {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.startDate}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.endDate}</td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                                                 <button
//                                                     onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
//                                                     className="text-indigo-600 hover:text-indigo-900 mr-4"
//                                                     title="Chỉnh sửa"
//                                                 >
//                                                     <PencilIcon className="h-5 w-5" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDeleteUser(user.id)}
//                                                     className="text-red-600 hover:text-red-900"
//                                                     title="Xóa"
//                                                 >
//                                                     <TrashIcon className="h-5 w-5" />
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     ))
//                                 ) : (
//                                     <tr>
//                                         <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
//                                             Không tìm thấy người dùng VIP nào.
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}

//                 {/* Phân trang */}
//                 {filteredUsers.length > usersPerPage && (
//                     <div className="mt-6 flex items-center justify-between">
//                         <div className="flex-1 flex justify-between sm:hidden">
//                             <button onClick={prevPage} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Trước</button>
//                             <button onClick={nextPage} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Sau</button>
//                         </div>
//                         <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-700">
//                                     Hiển thị <span className="font-medium">{indexOfFirstUser + 1}</span> đến <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> của <span className="font-medium">{filteredUsers.length}</span> kết quả
//                                 </p>
//                             </div>
//                             <div>
//                                 <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
//                                     <button
//                                         onClick={prevPage}
//                                         disabled={currentPage === 1}
//                                         className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         <span className="sr-only">Trước</span>
//                                         <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
//                                     </button>
//                                     {[...Array(totalPages).keys()].map(number => (
//                                         <button
//                                             key={number + 1}
//                                             onClick={() => paginate(number + 1)}
//                                             className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
//                                                 currentPage === number + 1
//                                                     ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
//                                                     : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
//                                             }`}
//                                         >
//                                             {number + 1}
//                                         </button>
//                                     ))}
//                                     <button
//                                         onClick={nextPage}
//                                         disabled={currentPage === totalPages}
//                                         className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                                     >
//                                         <span className="sr-only">Sau</span>
//                                         <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
//                                     </button>
//                                 </nav>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Modal Thêm/Chỉnh sửa người dùng */}
//             {isModalOpen && (
//                 <Modal onClose={() => { setIsModalOpen(false); setEditingUser(null); }}>
//                     <UserForm user={editingUser} onSave={handleSaveUser} isLoading={loading} />
//                 </Modal>
//             )}
//         </div>
//     );
// };

// export default AccountManagement;

// // =========================================================================
// // Component Modal (Giả định: Bạn cần tạo file src/components/Modal.jsx)
// // =========================================================================
// // src/components/Modal.jsx
// // Bạn cần tạo file này với nội dung tương tự sau:
// /*
// import React from 'react';

// const Modal = ({ children, onClose }) => {
//     return (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
//             <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
//                 <button
//                     onClick={onClose}
//                     className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
//                 >
//                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                 </button>
//                 {children}
//             </div>
//         </div>
//     );
// };

// export default Modal;
// */

// // =========================================================================
// // Component UserForm (Giả định: Bạn có thể đặt nó trong cùng file hoặc tách riêng)
// // =========================================================================
// // Có thể đặt trong cùng file VipAccountManagement.jsx hoặc tạo file src/components/UserForm.jsx
// const UserForm = ({ user, onSave, isLoading }) => {
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         level: 'Gold', // Mặc định
//         status: 'active', // Mặc định
//         startDate: '',
//         endDate: '',
//     });
//     const [formErrors, setFormErrors] = useState({});

//     useEffect(() => {
//         if (user) {
//             // Nếu là chỉnh sửa, điền dữ liệu người dùng vào form
//             setFormData({
//                 name: user.name,
//                 email: user.email,
//                 level: user.level,
//                 status: user.status,
//                 startDate: user.startDate,
//                 endDate: user.endDate,
//             });
//         } else {
//             // Nếu là thêm mới, reset form
//             setFormData({
//                 name: '',
//                 email: '',
//                 level: 'Gold',
//                 status: 'active',
//                 startDate: '',
//                 endDate: '',
//             });
//         }
//     }, [user]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//         // Xóa lỗi khi người dùng bắt đầu nhập
//         if (formErrors[name]) {
//             setFormErrors(prev => ({ ...prev, [name]: '' }));
//         }
//     };

//     const validateForm = () => {
//         const errors = {};
//         if (!formData.name.trim()) errors.name = 'Tên không được để trống.';
//         if (!formData.email.trim()) {
//             errors.email = 'Email không được để trống.';
//         } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//             errors.email = 'Email không hợp lệ.';
//         }
//         if (!formData.startDate) errors.startDate = 'Ngày bắt đầu không được để trống.';
//         if (!formData.endDate) errors.endDate = 'Ngày kết thúc không được để trống.';
//         if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
//             errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu.';
//         }
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (validateForm()) {
//             onSave({ ...formData, id: user ? user.id : null });
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="space-y-4">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4">{user ? 'Chỉnh sửa người dùng VIP' : 'Thêm người dùng VIP mới'}</h2>

//             <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên người dùng <span className="text-red-500">*</span></label>
//                 <input
//                     type="text"
//                     id="name"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
//             </div>

//             <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
//                 <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
//             </div>

//             <div>
//                 <label htmlFor="level" className="block text-sm font-medium text-gray-700">Cấp độ VIP</label>
//                 <select
//                     id="level"
//                     name="level"
//                     value={formData.level}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 >
//                     <option value="Gold">Gold</option>
//                     <option value="Platinum">Platinum</option>
//                     <option value="Diamond">Diamond</option>
//                 </select>
//             </div>

//             <div>
//                 <label htmlFor="status" className="block text-sm font-medium text-gray-700">Trạng thái</label>
//                 <select
//                     id="status"
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 >
//                     <option value="active">Hoạt động</option>
//                     <option value="inactive">Không hoạt động</option>
//                 </select>
//             </div>

//             <div>
//                 <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Ngày bắt đầu <span className="text-red-500">*</span></label>
//                 <input
//                     type="date"
//                     id="startDate"
//                     name="startDate"
//                     value={formData.startDate}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 {formErrors.startDate && <p className="mt-1 text-sm text-red-600">{formErrors.startDate}</p>}
//             </div>

//             <div>
//                 <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Ngày kết thúc <span className="text-red-500">*</span></label>
//                 <input
//                     type="date"
//                     id="endDate"
//                     name="endDate"
//                     value={formData.endDate}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//                 {formErrors.endDate && <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>}
//             </div>

//             <div className="flex justify-end pt-4">
//                 <button
//                     type="button"
//                     onClick={() => { /* Consider passing onClose prop to UserForm if it's external */ }}
//                     className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
//                 >
//                     Hủy
//                 </button>
//                 <button
//                     type="submit"
//                     disabled={isLoading}
//                     className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
//                 >
//                     {isLoading ? 'Đang lưu...' : (user ? 'Cập nhật' : 'Thêm')}
//                 </button>
//             </div>
//         </form>
//     );
// };