import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Template from './Template';
import DraggableCanvas from './DraggableCanvas';

const SubmitApplication = () => {
  const [posts, setPosts] = useState([]);
  const [items, setItems] = useState([

  ]);
  const [myTemplate, setMyTemplate] = useState([
    {
      id: Date.now(),
      name: "",
      templateItem: []
    }
  ]);


  console.log("Template", myTemplate);

  console.log('Dữ liệu nhận:', items);
  const [selectedPost, setSelectedPost] = useState(null); // Để chọn bài viết hiển thị trong DraggableCanvas
  const [loading, setLoading] = useState(false);




  


  const handleCreateNew = async () => {
    setLoading(true);

    const newTemplate = [{
      id: Date.now(),
      name: 'hi ',
      items: [...items]
    }];
    setMyTemplate(newTemplate);
    console.log(newTemplate[0]);


    // const source = axios.CancelToken.source();
    // 
    try {
      const response = await axios.post('http://nckh.local/api/post', newTemplate[0], {
        // cancelToken: source.token,
      });
      setPosts((prevPosts) => [...prevPosts, response.data]);
      setItems([]);
      setSelectedPost(response.data);
      console.log('Gửi dữ liệu thành công');
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Post request canceled:', error.message);
      } else {
        console.error('Có lỗi khi tạo bài viết:', error);
        toast.error('Tạo bài viết thất bại');
      }
    } finally {
      setLoading(false);
    }
  };



  const handleSelectPost = (post) => {
    setSelectedPost(post);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-6">
      <div className="flex-1">
        <Template
          items={items}
          setItems={setItems}
          onCreateNew={handleCreateNew}
          loading={loading} // Truyền loading để vô hiệu hóa nút "Tạo mới"
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

export default SubmitApplication;