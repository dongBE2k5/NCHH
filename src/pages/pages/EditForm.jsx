import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Template from '../../components/layout/Template';
import '../../assets/scss/Template.scss';

const EditForm = ({ forms, updateForm }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const form = forms.find((f) => f.id === parseInt(id));
  const [items, setItems] = useState(form ? [form] : []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (form) {
      setItems([form]);
    }
  }, [form]);

  const handleUpdate = (templateItems) => {
    setLoading(true);
    try {
      const updatedForm = {
        id: parseInt(id),
        ...templateItems[0],
      };
      updateForm(updatedForm);
      navigate('/forms');
    } catch (error) {
      console.error('Lỗi khi cập nhật đơn:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="container mx-auto px-4 py-8 text-gray-600">Đơn không tồn tại</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-academic-blue mb-4">Chỉnh Sửa Đơn Học Vụ</h1>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Template
          items={items}
          setItems={setItems}
          onCreateNew={handleUpdate}
          loading={loading}
        />
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-base">Đang xử lý...</div>
        </div>
      )}
    </div>
  );
};

export default EditForm;