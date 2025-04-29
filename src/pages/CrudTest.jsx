import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PostList from '../components/layout/PostList';
import PostForm from '../components/layout/PostForm';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../assets/scss/Crud.scss"

function CrudTest() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy danh sách bài viết khi component mount
  useEffect(() => {
    setIsLoading(true);
    axios
      .get('http://127.0.0.1:8000/api/posts')
      .then((response) => {
        // Kiểm tra cấu trúc dữ liệu API
        const data = Array.isArray(response.data) ? response.data : response.data.posts || [];
        setPosts(data);
      })
      .catch((error) => {
        console.error('Có lỗi khi lấy bài viết', error);
        toast.error('Lấy danh sách bài viết thất bại');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="">
      <PostForm setPosts={setPosts} />
      {isLoading ? (
        <p className="loading">Đang tải danh sách bài viết...</p>
      ) : (
        <PostList posts={posts} setPosts={setPosts} />
      )}
      <ToastContainer />
      <style>{`
       
        .loading {
          text-align: center;
          font-size: 18px;
          color: #333;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}

export default CrudTest;