import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useReactToPrint } from 'react-to-print';
import DOMPurify from 'dompurify';

function PostList({ posts, setPosts }) {
    const componentPDF = useRef();
    const [postToEdit, setPostToEdit] = useState({}); // Store post to edit

    // Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPostToEdit((prev) => ({ ...prev, [name]: value }));
    };

    // Bắt đầu chỉnh sửa bài viết
    const startEdit = (post) => {
        setPostToEdit({ ...post });
    };

    // Lưu chỉnh sửa
    const handleSaveEdit = (id) => {
        if (!postToEdit.id) return;

        axios
            .put(`http://127.0.0.1:8000/api/posts/${id}`, postToEdit)
            .then((response) => {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === id ? { ...post, ...postToEdit } : post
                    )
                );
                setPostToEdit({}); // Clear editing state
                toast.success('Bài viết đã được cập nhật');
            })
            .catch((error) => {
                console.error('Có lỗi khi cập nhật bài viết', error);
                toast.error('Cập nhật bài viết thất bại');
            });
    };

    // Hủy chỉnh sửa
    const cancelEdit = () => {
        setPostToEdit({});
    };

    // Xóa bài viết
    const deletePost = (id) => {
        axios
            .delete(`http://127.0.0.1:8000/api/posts/${id}`)
            .then(() => {
                setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
                toast.success('Xóa bài viết thành công');
            })
            .catch((error) => {
                console.error('Có lỗi khi xóa bài viết', error);
                toast.error('Xóa thất bại');
            });
    };
    const generatePDF = useReactToPrint({
        content: () => componentPDF.current,
        documentTitle: "Usedata",
        onAfterPrint: () => alert("Data seved in PDF")
    });
    return (
        <div ref={componentPDF} style={{ width: '100%' }}>

            <div className="container">
                <h2 className="text-2xl font-bold text-center mb-6">Danh sách bài viết</h2>

                {posts.length === 0 ? (
                    <p className="text-center">Không có bài viết nào.</p>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Title</th>
                                <th>Content</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post, index) => (
                                <tr key={post.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {postToEdit.id !== post.id ? (
                                            <span>{post.title}</span>
                                        ) : (
                                            <input
                                                name="title"
                                                value={postToEdit.title || ''}
                                                onChange={handleChange}
                                                className="input"
                                            />
                                        )}
                                    </td>
                                    <td>
                                        {postToEdit.id !== post.id ? (
                                            //  <span>{post.content}</span>
                                           <div
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(post.content),
                                            }}
                                        />

                                        ) : (
                                            <textarea
                                                name="content"
                                                value={postToEdit.content || ''}
                                                onChange={handleChange}
                                                className="textarea"
                                            />
                                        )}
                                        
                                    </td>
                                    <td>
                                        {postToEdit.id === post.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleSaveEdit(post.id)}
                                                    className="save-btn"
                                                >
                                                    Save
                                                </button>
                                                <button onClick={cancelEdit} className="cancel-btn">
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => startEdit(post)}
                                                className="edit-btn"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deletePost(post.id)}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <style>{`
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #f4f4f4;
          font-weight: bold;
        }
        .input, .textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .textarea {
          height: 80px;
          resize: vertical;
        }
        .edit-btn, .save-btn, .cancel-btn, .delete-btn {
          padding: 6px 12px;
          margin: 0 4px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .edit-btn {
          background: #428bca;
          color: #fff;
        }
        .save-btn {
          background: #28a745;
          color: #fff;
        }
        .cancel-btn {
          background: #6c757d;
          color: #fff;
        }
        .delete-btn {
          background: #dc3545;
          color: #fff;
        }
        .edit-btn:hover { background: #005cbf; }
        .save-btn:hover { background: #218838; }
        .cancel-btn:hover { background: #5a6268; }
        .delete-btn:hover { background: #c82333; }
      `}</style>
            </div>
            <button onClick={generatePDF}>
                Print
            </button>
        </div>
    );
}

export default PostList;