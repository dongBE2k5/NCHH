import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Template from '../../components/layout/Template'; // Giả định Template.jsx nằm ở thư mục gốc src

const Create = ({ addPost }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleCreateNew = async (templateItems) => {
    setLoading(true);
    try {
      const newPost = {
        id: Date.now(),
        ...templateItems[0], // Giả định mỗi lần tạo chỉ tạo 1 đơn
      };
      addPost(newPost);
      navigate('/list');
    } catch (error) {
      console.error('Lỗi khi tạo đơn:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tạo Đơn Mới</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Template
          items={items}
          setItems={setItems}
          onCreateNew={handleCreateNew}
          loading={loading}
        />
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-lg">Đang xử lý...</div>
        </div>
      )}
    </div>
  );
};

export default Create;