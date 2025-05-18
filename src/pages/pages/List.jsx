import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DraggableCanvas from '../../components/layout/DraggableCanvas'; // Giả định DraggableCanvas.jsx nằm ở thư mục gốc src

const List = ({ posts, deletePost }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  const handleSelectPost = (post) => {
    setSelectedPost(post);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Danh Sách Đơn</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3">
          {posts.length === 0 ? (
            <p className="text-gray-600">Không có đơn nào để hiển thị.</p>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh Sách Đơn</h2>
              <ul className="space-y-3 max-h-[600px] overflow-y-auto">
                {posts.map((post, index) => (
                  <li
                    key={post.id}
                    className={`p-4 border rounded-lg cursor-pointer ${
                      selectedPost === post ? 'bg-teal-100 border-teal-500' : 'border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleSelectPost(post)}
                  >
                    <div className="flex justify-between items-center">
                      <span>Đơn {index + 1}</span>
                      <div className="space-x-2">
                        <Link to={`/edit/${post.id}`} className="text-blue-500 hover:text-blue-700">Sửa</Link>
                        <button onClick={() => deletePost(post.id)} className="text-red-500 hover:text-red-700">Xóa</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-6 text-center">
            <Link to="/create" className="bg-teal-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-teal-600 transition">
              Tạo Đơn Mới
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-2/3">
          {selectedPost ? (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi Tiết Đơn</h2>
              <DraggableCanvas items={[selectedPost]} />
            </div>
          ) : (
            <p className="text-gray-600 text-center">Chọn một đơn để xem chi tiết.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default List;