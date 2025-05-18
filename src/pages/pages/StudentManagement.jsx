import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const StudentManagement = ({ students, addStudent, updateStudent, deleteStudent }) => {
  const [student, setStudent] = useState({ id: Date.now(), name: '', studentId: '', class: '' });
  const [editId, setEditId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      updateStudent({ ...student, id: editId });
      setEditId(null);
    } else {
      addStudent(student);
    }
    setStudent({ id: Date.now(), name: '', studentId: '', class: '' });
  };

  const handleEdit = (id) => {
    const studentToEdit = students.find((s) => s.id === id);
    setStudent(studentToEdit);
    setEditId(id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-academic-blue mb-4">Quản Lý Sinh Viên</h1>
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Họ Tên</label>
            <input type="text" name="name" value={student.name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-academic-blue" required />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mã SV</label>
            <input type="text" name="studentId" value={student.studentId} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-academic-blue" required />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Lớp</label>
            <input type="text" name="class" value={student.class} onChange={handleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-academic-blue" required />
          </div>
          <button type="submit" className="bg-academic-blue text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 transition">
            {editId ? 'Cập Nhật' : 'Thêm Mới'}
          </button>
        </form>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Danh Sách Sinh Viên</h2>
        {students.length === 0 ? (
          <p className="text-gray-600">Không có sinh viên nào.</p>
        ) : (
          <ul className="space-y-2 max-h-[400px] overflow-y-auto">
            {students.map((student) => (
              <li key={student.id} className="p-3 border rounded flex justify-between items-center">
                <div>
                  <div className="font-medium">{student.name}</div>
                  <div className="text-gray-600">{student.studentId} - {student.class}</div>
                </div>
                <div className="space-x-2">
                  <button onClick={() => handleEdit(student.id)} className="text-blue-500 hover:text-blue-700">Sửa</button>
                  <button onClick={() => deleteStudent(student.id)} className="text-red-500 hover:text-red-700">Xóa</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;