import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Template from '../../components/layout/Template';
import DraggableCanvas from '../../components/layout/DraggableCanvas';

const FormManagement = ({ forms, addForm, updateForm, deleteForm }) => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreateNew = (templateItems) => {
    setLoading(true);
    try {
      const newForm = {
        id: Date.now(),
        ...templateItems[0],
        studentId: `SV${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        status: 'Chờ xử lý',
      };
      addForm(newForm);
      setItems([]);
    } catch (error) {
      console.error('Lỗi khi tạo đơn:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectForm = (form) => {
    setSelectedForm(form);
    setItems([form]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-academic-blue mb-4">Quản Lý Đơn Học Vụ</h1>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Tạo Đơn Mới</h2>
            <Template
              items={items}
              setItems={setItems}
              onCreateNew={handleCreateNew}
              loading={loading}
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Danh Sách Đơn</h2>
            {forms.length === 0 ? (
              <p className="text-gray-600">Không có đơn nào.</p>
            ) : (
              <ul className="space-y-2 max-h-[350px] overflow-y-auto">
                {forms.map((form) => (
                  <li
                    key={form.id}
                    className={`p-3 border rounded cursor-pointer ${
                      selectedForm === form ? 'bg-academic-gray border-academic-blue' : 'border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelectForm(form)}
                  >
                    <div className="flex justify-between items-center">
                      <span>Đơn {form.id} - {form.status}</span>
                      <div className="space-x-2">
                        <Link to={`/edit-form/${form.id}`} className="text-blue-500 hover:text-blue-700">Sửa</Link>
                        <button onClick={() => deleteForm(form.id)} className="text-red-500 hover:text-red-700">Xóa</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="w-full lg:w-2/3">
          {selectedForm ? (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Chi Tiết Đơn</h2>
              <DraggableCanvas items={[selectedForm]} />
            </div>
          ) : (
            <p className="text-gray-600 text-center">Chọn một đơn để xem chi tiết.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormManagement;