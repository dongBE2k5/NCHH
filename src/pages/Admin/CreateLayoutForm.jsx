import React, { useState, useEffect, useRef } from "react";
import PreviewForm from "../PreviewForm";
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, LinkIcon, Eraser, Table2
} from 'lucide-react';

export default function CreateLayoutForm() {
  const [layout, setLayout] = useState([]);
  const [dataForm, setDataForm] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(2);
  const [showTableModal, setShowTableModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    onUpdate({ editor }) {
      setHtmlContent(editor.getHTML());
    }
  });

  useEffect(() => {
    const handleTabKey = (event) => {
      if (event.key === 'Tab' && editor?.isFocused) {
        event.preventDefault();
        editor.commands.insertContent('    ');
      }
    };
    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [editor]);

  useEffect(() => {
    const fetchFormDetail = async () => {
      try {
        const res = await fetch(`http://nckh.local/api/forms/${id}`);
        const result = await res.json();
        setDataForm(result);
        editor?.commands.setContent(result['form-model'] || '');
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchFormDetail();
  }, [id, editor]);

  const insertTable = () => {
    editor?.commands.insertTable({
      rows: parseInt(rows),
      cols: parseInt(cols),
      withHeaderRow: false,
    });
  };

  const insertVariableAtCursor = (text) => {
    editor?.commands.insertContent(text);
    // Sau khi insert đưa con trỏ sau vị trí 
    editor?.commands.focus();
  };

  const removeVietnameseTones = (str) => {
    return str
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };

  const storeForm = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://nckh.local/api/admin/create-layout-form/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "form-model": htmlContent })
      });
      const data = await res.json();
      alert("Tạo thành công");
      navigate('/admin/form-management');
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📝 Trình soạn thảo tạo đơn</h2>
      <div  className="flex gap-6">
        <div className="w-1/4 space-y-2">
          {dataForm.field_form?.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => insertVariableAtCursor(`{{${removeVietnameseTones(item.label)}}}`)}
              className="bg-blue-500 text-white w-full px-4 py-2 rounded"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="w-3/4">
          <div className="flex flex-wrap bg-white items-center p-3 gap-2 my-4">
            <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} className="toolbar-btn" title="H1">
              <Heading1 size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="toolbar-btn" title="H2">
              <Heading2 size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().toggleBold().run()} className="toolbar-btn" title="Bold">
              <Bold size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="toolbar-btn" title="Italic">
              <Italic size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className="toolbar-btn" title="Underline">
              <Underline size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().toggleStrike().run()} className="toolbar-btn" title="Strike">
              <Strikethrough size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="toolbar-btn" title="Bullet List">
              <List size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} className="toolbar-btn" title="Ordered List">
              <ListOrdered size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().setTextAlign('left').run()} className="toolbar-btn" title="Left">
              <AlignLeft size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().setTextAlign('center').run()} className="toolbar-btn" title="Center">
              <AlignCenter size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().setTextAlign('right').run()} className="toolbar-btn" title="Right">
              <AlignRight size={18} />
            </button>
            <button onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} className="toolbar-btn" title="Clear">
              <Eraser size={18} />
            </button>
            <button onClick={() => setShowTableModal(true)} className="toolbar-btn" title="Table">
              <Table2 size={18} />
            </button>
          </div>

          <div className="preview-content border border-gray-300 rounded p-3 min-h-[300px] h-fit mb-6 bg-white">
            <EditorContent className="editor " editor={editor} />
          </div>

          {/* <div className="border-t pt-4 mb-6">
            <h3 className="text-lg font-semibold mb-2">🔎 HTML Output</h3>
            <div className="border border-gray-200 rounded bg-gray-50 p-3 text-sm whitespace-pre-wrap overflow-auto max-h-[200px]">
              <code>{htmlContent}</code>
            </div>
          </div> */}

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-2">📄 Xem trước đơn đang tạo</h3>
            <div className="preview border border-gray-300 bg-white rounded p-6" dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>

          <button onClick={storeForm} type="submit" className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Lưu biểu mẫu
          </button>
        </div>
      </div>

      {showTableModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[300px] shadow-lg relative">
            <h3 className="text-lg font-semibold mb-4">🧩 Chèn bảng</h3>
            <label className="block mb-2">
              Số hàng:
              <input type="number" min="1" value={rows} onChange={(e) => setRows(e.target.value)} className="w-full mt-1 border px-2 py-1 rounded" />
            </label>
            <label className="block mb-4">
              Số cột:
              <input type="number" min="1" value={cols} onChange={(e) => setCols(e.target.value)} className="w-full mt-1 border px-2 py-1 rounded" />
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowTableModal(false)} className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-100">Hủy</button>
              <button onClick={() => { insertTable(); setShowTableModal(false); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Tạo bảng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
