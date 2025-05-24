import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Template from './Template';

const SubmitApplication = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [preparedData, setPreparedData] = useState(null);

  // Bấm "Tạo mới" sẽ hiện form nhập tên
  const handleCreateNew = () => {
    if (items.length === 0) {
      toast.error("Không có item nào để gửi");
      return;
    }

    // Lưu dữ liệu tạm vào state chờ gửi
    setPreparedData({
      id: Date.now(),
      name: '',
      items: [...items]
    });
    setShowNameForm(true);
  };

  // Sau khi nhập tên và bấm Gửi
  const handleSubmitName = async () => {
    if (!templateName.trim()) {
      toast.error('Vui lòng nhập tên');
      return;
    }

    const newTemplate = {
      ...preparedData,
      name: templateName.trim()
    };

    setLoading(true);
    setShowNameForm(false);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/post', newTemplate);
      toast.success('Gửi dữ liệu thành công');
      setItems([]);
      setTemplateName('');
      setPreparedData(null);
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu:', error);
      toast.error('Gửi dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-6">
      <div className="flex-1">
        <Template
          items={items}
          setItems={setItems}
          onCreateNew={handleCreateNew}
          loading={loading}
        />
      </div>

      {showNameForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Nhập tên template</h2>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Tên template"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNameForm(false);
                  setTemplateName('');
                  setPreparedData(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitName}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-lg">Đang xử lý...</div>
        </div>
      )}
    </div>
  );
};

export default SubmitApplication;
