import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Template from '../../components/layout/Template'; // Giả định Template.jsx nằm ở thư mục gốc src

const Edit = ({ posts, updatePost }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = posts.find((p) => p.id === parseInt(id));
  const [items, setItems] = useState(post ? [post] : []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (post) {
      setItems([post]);
    }
  }, [post]);

  const handleUpdate = async (templateItems) => {
    setLoading(true);
    try {
      const updatedPost = {
        id: parseInt(id),
        ...templateItems[0], // Giả định mỗi lần chỉnh sửa chỉ có 1 đơn
      };
      updatePost(updatedPost);
      navigate('/list');
    } catch (error) {
      console.error('Lỗi khi cập nhật đơn:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!post) return <div className="container mx-auto px-6 py-12 text-gray-600">Đơn không tồn tại</div>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Chỉnh Sửa Đơn</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Template
          items={items}
          setItems={setItems}
          onCreateNew={handleUpdate}
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

export default Edit;