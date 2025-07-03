import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DraggableCanvas from './DraggableCanvas';

const ReceiveApplication = () => {
  const [allTemplates, setAllTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllTemplates = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/posts');
        setAllTemplates(response.data);
        if (response.data.length > 0) {
          setSelectedId(response.data[0].id);
        }
      } catch (error) {
        toast.error('Lỗi khi lấy danh sách templates');
      }
    };
    fetchAllTemplates();
  }, []);

  useEffect(() => {
    const fetchTemplateDetail = async () => {
      if (!selectedId) return;
      setLoading(true);
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/get/${selectedId}`);
        setPosts(response.data.items || []);
      } catch (error) {
        toast.error('Lỗi khi lấy chi tiết template');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateDetail();
  }, [selectedId]);

  return (
    <div className="flex flex-row gap-6 max-w-7xl mx-auto p-6">
      {/* Cột trái: Select */}
      <div className="w-64">
        <label className="block mb-2 font-medium">Chọn template:</label>
        <select
          className="w-full border border-gray-300 px-4 py-2 rounded"
          value={selectedId || ''}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          {allTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {/* Cột phải: DraggableCanvas */}
      <div className="flex-1 border border-gray-200 rounded p-4">
        <DraggableCanvas items={posts} />
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-lg">Đang tải dữ liệu...</div>
        </div>
      )}
    </div>
  );
};

export default ReceiveApplication;
