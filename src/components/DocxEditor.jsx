import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';

export default function DocxEditor() {
  const [editorContent, setEditorContent] = useState('<p>Welcome to TinyMCE!</p>');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.docx')) {
      alert('Chỉ hỗ trợ file .docx');
      return;
    }

    const formData = new FormData();
    formData.append('docx', file);

    try {
      setUploading(true);
      const response = await axios.post('http://localhost:8000/api/convert-docx-to-html', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setEditorContent(response.data.html);
    } catch (err) {
      console.error(err);
      alert('Tải file Word thất bại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ background: '#ccc', padding: '40px 0' }}>
      <div
        style={{
          background: '#fff',
          width: '794px',
          minHeight: '1123px',
          margin: 'auto',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '10px' }}>
          <label htmlFor="docx-upload">
            <input
              id="docx-upload"
              type="file"
              accept=".docx"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          {uploading && <p>Đang tải...</p>}
        </div>

        <Editor
          apiKey="qs2x0kwunb2begoc4cmbvtf00br98ngvsq2wtkiykz4zlcyi"
          value={editorContent}
          onEditorChange={(newContent) => setEditorContent(newContent)}
          init={{
            height: 1123,
            menubar: 'file edit view insert format tools table help',
            plugins: [
              'anchor', 'autolink', 'charmap', 'codesample', 'emoticons',
              'image', 'link', 'lists', 'media', 'searchreplace', 'table',
              'visualblocks', 'wordcount', 'checklist', 'mediaembed',
              'casechange', 'formatpainter', 'pageembed', 'a11ychecker',
              'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable',
              'advcode', 'editimage', 'advtemplate', 'importword', 'exportword', 'exportpdf'
            ],
            toolbar:
              'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | checklist numlist bullist | removeformat',
            content_style: `
              body {
                font-family: 'Times New Roman', serif;
                // padding: 40px;
                background: white;
              }
              p {
           
                line-height: 1;
              }
            `,
          }}
        />
      </div>
    </div>
  );
}
