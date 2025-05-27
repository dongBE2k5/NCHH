import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DraggableCanvas from './DraggableCanvas';

const ReceiveApplication = () => {
  const [allTemplates, setAllTemplates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách tất cả template
  useEffect(() => {
    const fetchAllTemplates = async () => {
      try {
        const response = await axios.get('http://nckh.local/api/get'); // API lấy danh sách tất cả template
        setAllTemplates(response.data);
        if (response.data.length > 0) {
          setSelectedId(response.data[0].id); // mặc định chọn template đầu tiên
        }
      } catch (error) {
        toast.error('Lỗi khi lấy danh sách templates');
      }
    };
    fetchAllTemplates();
  }, []);

  // Khi `selectedId` thay đổi thì gọi API lấy chi tiết template
  useEffect(() => {
    const fetchTemplateDetail = async () => {
      if (!selectedId) return;
      setLoading(true);
      try {
// <<<<<<< taiv2
//         const response = await axios.get(`http://nckh.local/api/get/${id}`);
//         console.log(response.data);
//          setPosts(response.data.items); 
//         // setPosts((prevPosts) => [...prevPosts, response.data]); 
        
//         console.log(posts);
//         // console.log(posts.items);
        
//         console.log('Lấy danh sách bài viết thành công');
// =======
        const response = await axios.get(`http://nckh.local/api/get/${selectedId}`);
        setPosts(response.data.items || []);
// >>>>>>> dong
      } catch (error) {
        toast.error('Lỗi khi lấy chi tiết template');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateDetail();
  }, [selectedId]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-6">
      {/* Select box để chọn template */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Chọn template:</label>
        <select
          className="w-full md:w-80 border border-gray-300 px-4 py-2 rounded"
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

      {/* Canvas */}
      <DraggableCanvas items={posts} />

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-lg">Đang tải dữ liệu...</div>
        </div>
      )}
    </div>
  );
};

export default ReceiveApplication;
