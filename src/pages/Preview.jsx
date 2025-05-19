import React, { useState, useEffect } from "react";
import 'react-quill/dist/quill.snow.css';
import PreviewForm from "../components/PreviewForm";

export default function Preview() {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    fetch("http://nckh.local/api/admin/show-form/2")
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi kết nối mạng");
        return res.json();
      })
      .then((data) => {
        setHtmlContent(data["form-model"]);
      })
      .catch((err) => console.error("Lỗi khi tải dữ liệu:", err));
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="mt-4">
        <h4 className="font-semibold">Mã HTML:</h4>
        <pre className="p-4 border rounded bg-gray-50 whitespace-pre-wrap">{htmlContent}</pre>
      </div>
      <PreviewForm html={htmlContent} />
    </div>
  );
}
