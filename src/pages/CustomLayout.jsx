import React, { useState, useEffect } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import CSS của Quill
import PreviewForm from "../components/PreviewForm";

const mockApi = {
  async saveLayout(layout) {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem("formLayout", JSON.stringify(layout));
        resolve({ status: "ok" });
      }, 500);
    });
  },
  async loadLayout() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const saved = localStorage.getItem("formLayout");
        resolve(saved ? JSON.parse(saved) : []);
      }, 500);
    });
  },
};

const defaultLayout = [
  { i: "1", x: 0, y: 0, w: 4, h: 2, label: "Họ tên", type: "text" },
  { i: "2", x: 4, y: 0, w: 4, h: 2, label: "Email", type: "email" },
  { i: "3", x: 8, y: 0, w: 4, h: 2, label: "Số điện thoại", type: "tel" },
];

export default function FormBuilder() {
  const [layout, setLayout] = useState([]);
  const [previewLayout, setPreviewLayout] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [counter, setCounter] = useState(4);
  const [dataForm, setDataForm] = useState([]);
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    async function fetchData() {
      const serverLayout = await mockApi.loadLayout();
      setLayout(serverLayout.length ? serverLayout : defaultLayout);
    }

    // fetch("http://nckh.local/api/get-field-form/1")
    //   .then((res) => {
    //     if (!res.ok) throw new Error("Network error");
    //     return res.json();
    //   })
    //   .then((data) => setDataForm(data))
    //   .catch((err) => console.error("Lỗi khi tải dữ liệu:", err));

    fetchData();
  }, []);

  const resetLayout = () => setLayout(defaultLayout);

  const addNewField = () => {
    const newItem = {
      i: String(counter),
      x: 0,
      y: Infinity,
      w: 4,
      h: 2,
      label: `Trường ${counter}`,
      type: "text",
    };
    setCounter(counter + 1);
    setLayout([...layout, newItem]);
  };

  const handlePreview = () => {
    setPreviewLayout(layout);
    setPreviewMode(true);
  };

  const handleSave = async () => {
    if (previewMode) {
      await mockApi.saveLayout(previewLayout);
      setLayout(previewLayout);
      setPreviewMode(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align', 
    'link', 'image',
  ];

  const handleChange = (value) => {
    setContent(value);
    setHtmlContent(value);  // Lưu mã HTML vào state
  };

  const storeForm = (e) => {
    e.preventDefault();
    fetch("http://nckh.local/api/admin/create-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "name": "Nghir hoc",
        "form-model": htmlContent
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((data) => setDataForm(data))
      .catch((err) => console.error("Lỗi khi tải dữ liệu:", err));
  };
  

  return (
    <>
    <form onSubmit={storeForm}>
      <div className="max-w-2xl mx-auto mt-6">
        {/* Editor Quill */}
        <ReactQuill
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          theme="snow"
          className="bg-white"
        />
        
        {/* Hiển thị nội dung HTML */}
        <div className="mt-4">
          <h4 className="font-semibold">Mã HTML:</h4>
          <pre className="p-4 border rounded bg-gray-50">{htmlContent}</pre>
        </div>

        {/* Xem trước HTML
        <div className="mt-4">
          <h4 className="font-semibold">Xem trước:</h4>
          <div
            className="ql-container ql-editor ql-snow p-4 border rounded bg-gray-50"
            dangerouslySetInnerHTML={{
              __html: htmlContent
            }}  
          />
        </div>
            <PreviewForm
              data={data}
            ></PreviewForm> */}
        <PreviewForm html={htmlContent} />
      </div>
      </form>
    </>
  );
}
