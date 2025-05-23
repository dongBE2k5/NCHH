import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DraggableCanvas from './DraggableCanvas';

const ReceiveApplication = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const id = 16;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://nckh.local/api/get/${id}`);
        console.log(response.data);
         setPosts(response.data.items); 
        // setPosts((prevPosts) => [...prevPosts, response.data]); 
        
        console.log(posts);
        // console.log(posts.items);
        
        console.log('Lấy danh sách bài viết thành công');
      } catch (error) {
        console.error('Lỗi khi lấy bài viết:', error);
        toast.error('Lấy danh sách bài viết thất bại');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [id]);

  const handleSelectPost = (post) => {
    console.log('Selected:', post);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-6">
     

      <DraggableCanvas items={posts} />
    </div>
  );
};

export default ReceiveApplication;
