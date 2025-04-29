import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function PostForm({ setPosts }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation cơ bản
    if (!title.trim() || !content.trim()) {
      toast.error('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    const postData = { title, content };

    // Tạo mới bài viết
    axios
      .post('http://127.0.0.1:8000/api/posts', postData)
      .then((response) => {
        // Thêm bài viết mới vào danh sách
        setPosts((prevPosts) => [...prevPosts, response.data]);
        // Reset form
        setTitle('');
        setContent('');
        toast.success('Tạo bài viết thành công');
      })
      .catch((error) => {
        console.error('Có lỗi khi tạo bài viết', error);
        toast.error('Tạo bài viết thất bại');
      });
  };

  return (
    <div className="form-container">
      <h2 className="text-2xl font-bold mb-4">Thêm mới bài viết</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Tiêu đề:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Nhập tiêu đề"
            required
          />
        </div>
        <div className="form-group">
          <label>Nội dung:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="textarea"
            placeholder="Nhập nội dung"
            required
          />
        </div>
        <button type="submit" className="submit-btn">
          Tạo mới
        </button>
      </form>

      <style>{`
        .form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input, .textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 16px;
        }
        .textarea {
          height: 120px;
          resize: vertical;
        }
        .submit-btn {
          padding: 10px;
          background: #28a745;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        .submit-btn:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
}

export default PostForm;