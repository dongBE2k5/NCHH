import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Template from './Template';
import DraggableCanvas from './DraggableCanvas';

const Submit = () => {
  const [posts, setPosts] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null); // Để chọn bài viết hiển thị trong DraggableCanvas
  const [loading, setLoading] = useState(false);

  // Lấy danh sách bài viết khi component mount
  useEffect(() => {
    let isMounted = true; // Tránh race condition
    const source = axios.CancelToken.source(); // Để hủy API call

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/posts', {
          cancelToken: source.token,
        });
        if (isMounted) {
          setPosts(response.data);
          toast.success('Lấy danh sách bài viết thành công');
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Fetch posts canceled:', error.message);
        } else {
          console.error('Có lỗi khi lấy danh sách bài viết:', error);
          if (isMounted) {
            toast.error('Lấy danh sách bài viết thất bại');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    // Cleanup khi component unmount
    return () => {
      isMounted = false;
      source.cancel('Component unmounted, canceling API request');
    };
  }, []); // Chỉ chạy một lần khi mount

  const handleCreateNew = async (templateItems) => {
    setLoading(true);
    const source = axios.CancelToken.source();

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/posts', templateItems, {
        cancelToken: source.token,
      });
      // Thêm bài viết mới vào danh sách
      setPosts((prevPosts) => [...prevPosts, response.data]);
      // Reset form
      setItems([]);
      setSelectedPost(response.data); // Hiển thị bài viết vừa tạo trong DraggableCanvas
      toast.success('Gửi dữ liệu thành công');
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

    // Cleanup không cần thiết vì request này không lặp lại
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
      <div className="flex-1 space-y-4">
        <div className="w-full md:w-64 space-y-2">
          <h3 className="text-lg font-medium">Danh sách bài viết</h3>
          {posts.length === 0 ? (
            <p className="text-gray-500">Chưa có bài viết nào.</p>
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {posts.map((post, index) => (
                <li
                  key={post.id || index} // Sử dụng post.id nếu API trả về, nếu không dùng index
                  className={`p-2 border rounded-lg cursor-pointer ${
                    selectedPost === post ? 'bg-blue-100 border-blue-500' : 'border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleSelectPost(post)}
                >
                  Bài viết {index + 1}
                </li>
              ))}
            </ul>
          )}
        </div>
        <DraggableCanvas items={selectedPost ? [selectedPost] : []} />
      </div>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-lg">Đang xử lý...</div>
        </div>
      )}
    </div>
  );
};

export default Submit;