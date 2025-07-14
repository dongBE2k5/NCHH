// src/pages/DocxViewer.jsx
import React, { useState } from 'react';
import mammoth from 'mammoth'; // Import thư viện mammoth
import'./docx-viewer-content.css'
function DocxViewer() {
  const [htmlContent, setHtmlContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
        setFileName(file.name);
        setError('');
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            // Đọc file dưới dạng ArrayBuffer
            const arrayBuffer = e.target.result;
            
            // Chuyển đổi DOCX sang HTML bằng mammoth
            const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
            setHtmlContent(result.value); // result.value chứa HTML đã chuyển đổi
            // result.messages chứa các cảnh báo hoặc lỗi trong quá trình chuyển đổi
          } catch (err) {
            console.error("Lỗi khi đọc hoặc chuyển đổi file:", err);
            setError("Không thể đọc hoặc hiển thị file. Vui lòng kiểm tra định dạng.");
            setHtmlContent('');
          }
        };

        reader.onerror = () => {
          setError("Lỗi khi đọc file.");
          setHtmlContent('');
        };

        reader.readAsArrayBuffer(file);
      } else {
        setError("Vui lòng tải lên một file .docx hợp lệ.");
        setHtmlContent('');
        setFileName('');
      }
    } else {
      setFileName('');
      setHtmlContent('');
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8 text-center">Xem File Word (.docx) Online</h1>

        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
          <label htmlFor="docx-upload" className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out shadow-md font-medium text-lg">
            Chọn File .docx
            <input
              id="docx-upload"
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {fileName && <span className="text-gray-700 text-lg">Đã chọn: <span className="font-semibold">{fileName}</span></span>}
        </div>

        {error && (
          <div className="text-red-600 text-lg text-center mb-6 p-3 bg-red-100 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {htmlContent && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Nội dung File Word:</h2>
            <div 
              className="border border-gray-300 p-6 bg-gray-50 rounded-lg shadow-inner docx-viewer-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
              style={{ minHeight: '400px', maxHeight: '70vh', overflowY: 'auto' }}
            />
             <p className="text-sm text-gray-500 mt-4 text-center">
              Lưu ý: Việc hiển thị có thể không hoàn toàn giống với Microsoft Word.
            </p>
          </div>
        )}

        {!fileName && !error && !htmlContent && (
          <div className="text-center text-gray-500 text-xl mt-12">
            Vui lòng chọn một file .docx để xem nội dung.
          </div>
        )}
      </div>
    </div>
  );
}

export default DocxViewer;