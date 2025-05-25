import React, { useState, useEffect, useRef } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import CSS của Quill
import PreviewForm from "../PreviewForm";
import { Link, useParams } from 'react-router-dom';


export default function CreateLayoutForm() {
    const [layout, setLayout] = useState([]);
    const [previewLayout, setPreviewLayout] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const [counter, setCounter] = useState(4);
    const [dataForm, setDataForm] = useState([]);
    const [content, setContent] = useState("");
    const [htmlContent, setHtmlContent] = useState('');
    const { id } = useParams();
    const quillRef = useRef(null);

    useEffect(() => {


        // fetch("http://nckh.local/api/get-field-form/1")
        //   .then((res) => {
        //     if (!res.ok) throw new Error("Network error");
        //     return res.json();
        //   })
        //   .then((data) => setDataForm(data))
        //   .catch((err) => console.error("Lỗi khi tải dữ liệu:", err));

        async function getFormDetail() {
            console.log("Id " + id);

            try {
                const url = `http://nckh.local/api/forms/${id}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const result = await response.json();
                setDataForm(result);
                console.log("Form detail: " + JSON.stringify(result.field_form));
            } catch (error) {
                console.error("Failed to fetch forms:", error);
            }
        }


        getFormDetail();

    }, []);
    if (!dataForm) {
        return <div className="text-center py-10">Đang tải biểu mẫu...</div>;
    }
    const insertVariableAtCursor = (text) => {
        const editor = quillRef.current?.getEditor(); // Lấy instance của Quill
        const range = editor?.getSelection();         // Lấy vị trí con trỏ

        if (range) {
            editor.insertText(range.index, text);     // Chèn text tại vị trí con trỏ
            editor.setSelection(range.index + text.length); // Di chuyển con trỏ sau text mới
        }
    };

    const removeVietnameseTones = (str) => {
        return str
            .normalize("NFD") // Tách dấu khỏi ký tự gốc
            .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D")
            .replace(/\s+/g, " ") // Xóa khoảng trắng thừa
            .trim()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // PascalCase
            .join("");
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
        fetch(`http://nckh.local/api/admin/create-layout-form/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "form-model": htmlContent
            })
        })
            .then((res) => {
                if (!res.ok) throw new Error("Network error");
                return res.json();
            })
            .then((data) => {
                setDataForm(data);
                alert("Tạo thành công");
                console.log(data);
            })
            .catch((err) => console.error("Lỗi khi tải dữ liệu:", err));
    };


    return (
        <>
            <div className="py-[72px] flex  gap-4">
                <div className="w-1/4 mt-16">
                    {dataForm.field_form?.map((item, index) => (
                        <div className="my-5" key={index}>
                            <button
                                onClick={() => insertVariableAtCursor(`{{${removeVietnameseTones(item.label)}}}`)}
                                className="bg-blue-500 text-white w-[100px] px-4 py-2 rounded-md"
                            >
                                {item.label}
                            </button>
                        </div>
                    ))}
                </div>
                <div className="w-2/4">
                    <form onSubmit={storeForm}>
                        <div className="max-w-2xl mx-auto mt-6">
                            {/* Editor Quill */}
                            <ReactQuill
                                ref={quillRef}
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

                            Xem trước HTML
        <div className="mt-4">
          <h4 className="font-semibold">Xem trước:</h4>
          <div
            className="ql-container ql-editor ql-snow p-4 border rounded bg-gray-50"
            dangerouslySetInnerHTML={{
              __html: htmlContent
            }}  
          />
        </div>
            {/* <PreviewForm
              data={data}
            ></PreviewForm>
                            <PreviewForm html={htmlContent} /> */}
                        </div>
                        <button className="bg-blue-500 my-5 text-white px-4 py-2 rounded-md" type="submit">Save</button>
                        <Link to={`/admin/preview-form/${id}`} className="bg-red-500 text-white px-4 py-2 rounded-md">Preview</Link>
                    </form>
                </div>
            </div>
        </>
    );
}