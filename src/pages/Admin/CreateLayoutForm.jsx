import React, { useState, useEffect, useRef } from "react";
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useNavigate, useParams } from 'react-router-dom';



import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from "primereact/inputtext";
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Eraser, Table2
} from 'lucide-react';
import RawHtmlBlock from "./RawHtmlBlock";
import EditableGridBlock from "./EditableGridBlock";
import ParagraphClassExtension from "./extension/ParagraphClassExtension";

export default function CreateLayoutForm() {
  const [dataForm, setDataForm] = useState([]);
  const [htmlContent, setHtmlContent] = useState('');
  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(2);
  const [showTableModal, setShowTableModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAttribute, setShowAttribute] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleDialogHeading, setVisibleDialogHeading] = useState(false);
  const [visibleDialogContainer, setVisibleDialogContainer] = useState(false);
  const [value, setValue] = useState('');
  const [isBorderLeft, setIsBorderLeft] = useState(false);
  const [isBorderCenter, setIsBorderCenter] = useState(false);
  const [isBorderRight, setIsBorderRight] = useState(false);
  const [positionItemValue, setPositionItemValue] = useState('');
  const [widthItem, setWidthItem] = useState(100);
  const [selectedNodePos, setSelectedNodePos] = useState(null);
  const [selectedNodeAttrs, setSelectedNodeAttrs] = useState(null);






  const editor = useEditor({
    extensions: [
      StarterKit,
      ParagraphClassExtension,
      UnderlineExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      EditableGridBlock,
    ],
    content: '',
  })


  useEffect(() => {
    const handleClick = (event) => {
      if (!editor) return;

      const pos = editor.view.posAtCoords({
        left: event.clientX,
        top: event.clientY,
      });

      if (!pos) return;

      const $pos = editor.state.doc.resolve(pos.pos);
      const node = $pos.node($pos.depth);

      if (!node || !node.attrs) return;

      const oldStyle = node.attrs.style || '';
      const currentWidth = getInlineStyle(oldStyle, 'width') || '100%';

      setSelectedNodePos($pos.before($pos.depth));
      setSelectedNodeAttrs(node.attrs);
      setWidthItem(currentWidth.replace('%', ''));
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
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
  console.log(editor.getHTML());
  const insertTable = () => {
    editor?.commands.insertTable({
      rows: parseInt(rows),
      cols: parseInt(cols),
      withHeaderRow: false,
    });
  };

  const insertVariableAtCursor = (text) => {
    editor?.commands.insertContent(text);
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

  const saveForm = async (e) => {
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
      console.error("Lỗi khi lưu biểu mẫu:", err);
    }
  };

  const headingRender = () => {

    setShowAttribute(true);
  }

  const headingSubmit = (e) => {
    e.preventDefault();
    const content = e.target.content.value;
    const position = e.target.position.value;
    editor?.commands.insertContent(`<h1>${content}</h1>`);
    editor?.commands.setTextAlign(position);
    editor?.commands.focus();
    setShowAttribute(false);
  };

  const updateWidth = (newWidth) => {
    if (!editor || selectedNodePos === null || !selectedNodeAttrs) return;

    const oldStyle = selectedNodeAttrs.style || '';
    const newStyle = replaceInlineStyle(oldStyle, 'width', `${newWidth}%`);

    editor.chain().command(({ tr }) => {
      tr.setNodeMarkup(selectedNodePos, undefined, {
        ...selectedNodeAttrs,
        style: newStyle,
      });
      return true;
    }).run();
  };

  const positionItem = (item) => {
    if (item == "left") {
      setIsBorderRight(false)
      setIsBorderCenter(false)
      setIsBorderLeft(true)
      setPositionItemValue("left")
    }
    else if (item == "center") {
      setIsBorderLeft(false)
      setIsBorderRight(false)
      setIsBorderCenter(true)
      setPositionItemValue("center")
    }
    else {
      setIsBorderCenter(false)
      setIsBorderLeft(false)
      setIsBorderRight(true)
      setPositionItemValue("right")
    }
  };

  const renderItemHTML = (e) => {
    e.preventDefault()

    // Tạo đoạn HTML được căn lề
    const html = `<div style="display: flex; justify-content: ${positionItemValue}; margin-bottom: 8px;">
      <div>${value}</div>
    </div>
  `
    // Chèn HTML vào vị trí hiện tại của con trỏ trong editor
    editor.commands.insertContent(html)

    // Đóng dialog
    setVisibleDialogHeading(false)
    setVisible(false)
  }
  const handleClick = (event) => {
    // Nếu click vào input (hoặc bên trong input), thì bỏ qua không xử lý
    if (event.target.closest('input') || event.target.closest('textarea')) {
      return;
    }

    if (!editor) return;

    const pos = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
    if (!pos) return;

    const $pos = editor.state.doc.resolve(pos.pos);
    const node = $pos.node($pos.depth);

    if (!node || !node.type || !node.attrs) return;

    const oldStyle = node.attrs.style || '';
    const currentWidth = getInlineStyle(oldStyle, 'width') || '100%';

    // Lưu vị trí & thuộc tính của node
    setSelectedNodePos($pos.before($pos.depth));
    setSelectedNodeAttrs(node.attrs);
    setWidthItem(currentWidth.replace('%', ''));
  };

  const getInlineStyle = (styleStr, property) => {
    const styleMap = {};
    styleStr.split(';').forEach(part => {
      const [key, val] = part.split(':').map(s => s.trim());
      if (key) styleMap[key] = val;
    });
    return styleMap[property];
  };


  const replaceInlineStyle = (styleStr, property, newValue) => {
    const styleMap = {}
    styleStr.split(';').forEach(part => {
      const [key, val] = part.split(':').map(s => s.trim())
      if (key) styleMap[key] = val
    })
    styleMap[property] = newValue

    return Object.entries(styleMap)
      .map(([key, val]) => `${key}: ${val}`)
      .join('; ')
  }

  const replaceTailwindClass = (classString, prefix, newValue) => {
    const regex = new RegExp(`${prefix}-\\[(.*?)\\]`)
    if (regex.test(classString)) {
      return classString.replace(regex, `${prefix}-[${newValue}]`)
    } else {
      return `${classString} ${prefix}-[${newValue}]`
    }
  }

  const formatColumn = (formart) => {
    const numCols = parseInt(formart)
    const width = parseInt(100.0 / numCols)
    console.log(width);

    const content = []
    for (let i = 1; i <= numCols; i++) {
      content.push({
        type: 'paragraph',
        attrs: {
          style: `width: ${width}%; border: 2px dashed #ccc;`,
        },
        content: [{ type: 'text', text: `Cột ${i}` }],
      })
    }

    editor.commands.insertContent({
      type: 'editableGridBlock',
      attrs: {
        columns: numCols,
        width: width,
      },
      content,
    })
  }

  return (
    <div className="flex justify-end">
      <div className=" p-4 w-1/4 h-screen">
        <div className="card flex justify-content-center">
          <Sidebar visible={visible} onHide={() => setVisible(false)}>
            <h2 className="font-bold py-4">Các Công cụ hổ trợ</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="card flex justify-content-center border-2 px-4 py-8 rounded-md">
                <Button label="Headding" icon="pi pi-external-link" onClick={() => setVisibleDialogHeading(true)} />
                <Dialog header="Headding" visible={visibleDialogHeading} style={{ width: '50vw' }} onHide={() => { if (!visibleDialogHeading) return; setVisibleDialogHeading(false); }}>
                  <form action="" onSubmit={renderItemHTML}>
                    <div className="item-1 py-4">
                      <label htmlFor="username">Headding</label>
                      <FloatLabel>
                        <InputText className="p-2 w-full" id="username" value={value} onChange={(e) => setValue(e.target.value)} />

                      </FloatLabel>
                    </div>
                    <div className="item-2 py-4">
                      <label htmlFor="username">Position</label>
                      <FloatLabel>

                        <div className="grid grid-cols-3 gap-4">
                          <div onClick={() => positionItem("left")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderLeft && ("border-red-400")}`}>
                            <i className="pi pi-align-left text-xl" />
                          </div>
                          <div onClick={() => positionItem("center")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderCenter && ("border-red-400")}`}>
                            <i className="pi pi-align-center text-xl" />
                          </div>
                          <div onClick={() => positionItem("right")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderRight && ("border-red-400")}`}>
                            <i className="pi pi-align-right text-xl" />
                          </div>
                        </div>
                      </FloatLabel>
                    </div>
                    <div className="item-3 py-4">
                      <Button className="bg-green-400 p-2 text-white" label="Save" />
                    </div>

                  </form>
                </Dialog>
              </div>
              <div className="card flex justify-content-center border-2 px-4 py-8 rounded-md">

                <Button label="Container" icon="pi pi-external-link" onClick={() => setVisibleDialogContainer(true)} />
                <Dialog header="Container" visible={visibleDialogContainer} style={{ width: '50vw' }} onHide={() => { if (!visibleDialogContainer) return; setVisibleDialogContainer(false); }}>
                  <form action="" >

                    <div className="item-2 py-4">
                      <label htmlFor="username">Chọn định dạng</label>
                      <FloatLabel>

                        <div className="grid grid-cols-4 gap-4">
                          <div onClick={() => formatColumn(1)} className="item-1 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                          <div onClick={() => formatColumn(2)} className="item-2 flex gap-2 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                          <div onClick={() => formatColumn(3)} className="item-3 flex gap-2 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                          <div onClick={() => formatColumn(4)} className="item-4 flex gap-2 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                        </div>
                      </FloatLabel>
                    </div>
                    <div className="item-3 py-4">
                      <Button className="bg-green-400 p-2 text-white" label="Save" />
                    </div>

                  </form>
                </Dialog>
              </div>
              <div className="card flex justify-content-center border-2 px-4 py-8 rounded-md">
                <Button label="Textarea" icon="pi pi-external-link" onClick={() => setVisibleDialogHeading(true)} />
                <Dialog header="Headding" visible={visibleDialogHeading} style={{ width: '50vw' }} onHide={() => { if (!visibleDialogHeading) return; setVisibleDialogHeading(false); }}>
                  <form action="" onSubmit={renderItemHTML}>
                    <div className="item-1 py-4">
                      <label htmlFor="username">Headding</label>
                      <FloatLabel>
                        <InputText className="p-2 w-full" id="username" value={value} onChange={(e) => setValue(e.target.value)} />

                      </FloatLabel>
                    </div>
                    <div className="item-2 py-4">
                      <label htmlFor="username">Position</label>
                      <FloatLabel>

                        <div className="grid grid-cols-3 gap-4">
                          <div onClick={() => positionItem("left")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderLeft && ("border-red-400")}`}>
                            <i className="pi pi-align-left text-xl" />
                          </div>
                          <div onClick={() => positionItem("center")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderCenter && ("border-red-400")}`}>
                            <i className="pi pi-align-center text-xl" />
                          </div>
                          <div onClick={() => positionItem("right")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderRight && ("border-red-400")}`}>
                            <i className="pi pi-align-right text-xl" />
                          </div>
                        </div>
                      </FloatLabel>
                    </div>
                    <div className="item-3 py-4">
                      <Button className="bg-green-400 p-2 text-white" label="Save" />
                    </div>

                  </form>
                </Dialog>
              </div>
              <div className="card flex justify-content-center border-2 px-4 py-8 rounded-md">

                <Button label="Lable" icon="pi pi-external-link" onClick={() => setVisibleDialogContainer(true)} />
                <Dialog header="Lable" visible={visibleDialogContainer} style={{ width: '50vw' }} onHide={() => { if (!visibleDialogContainer) return; setVisibleDialogContainer(false); }}>
                  <form action="" >

                    <div className="item-2 py-4">
                      <label htmlFor="username">Chọn định dạng</label>
                      <FloatLabel>

                        <div className="grid grid-cols-4 gap-4">
                          <div onClick={() => formatColumn(1)} className="item-1 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                          <div onClick={() => formatColumn(2)} className="item-2 flex gap-2 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                          <div onClick={() => formatColumn(3)} className="item-3 flex gap-2 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                          <div onClick={() => formatColumn(4)} className="item-4 flex gap-2 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                        </div>
                      </FloatLabel>
                    </div>
                    <div className="item-3 py-4">
                      <Button className="bg-green-400 p-2 text-white" label="Save" />
                    </div>

                  </form>
                </Dialog>
              </div>
              <div className="card flex justify-content-center border-2 px-4 py-8 rounded-md">
                <Button label="Image" icon="pi pi-external-link" onClick={() => setVisibleDialogHeading(true)} />
                <Dialog header="Headding" visible={visibleDialogHeading} style={{ width: '50vw' }} onHide={() => { if (!visibleDialogHeading) return; setVisibleDialogHeading(false); }}>
                  <form action="" onSubmit={renderItemHTML}>
                    <div className="item-1 py-4">
                      <label htmlFor="username">Headding</label>
                      <FloatLabel>
                        <InputText className="p-2 w-full" id="username" value={value} onChange={(e) => setValue(e.target.value)} />

                      </FloatLabel>
                    </div>
                    <div className="item-2 py-4">
                      <label htmlFor="username">Position</label>
                      <FloatLabel>

                        <div className="grid grid-cols-3 gap-4">
                          <div onClick={() => positionItem("left")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderLeft && ("border-red-400")}`}>
                            <i className="pi pi-align-left text-xl" />
                          </div>
                          <div onClick={() => positionItem("center")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderCenter && ("border-red-400")}`}>
                            <i className="pi pi-align-center text-xl" />
                          </div>
                          <div onClick={() => positionItem("right")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderRight && ("border-red-400")}`}>
                            <i className="pi pi-align-right text-xl" />
                          </div>
                        </div>
                      </FloatLabel>
                    </div>
                    <div className="item-3 py-4">
                      <Button className="bg-green-400 p-2 text-white" label="Save" />
                    </div>

                  </form>
                </Dialog>
              </div>
              <div className="card flex justify-content-center border-2 px-4 py-8 rounded-md">

                <Button label="Div" icon="pi pi-external-link" onClick={() => setVisibleDialogContainer(true)} />
                <Dialog header="Container" visible={visibleDialogContainer} style={{ width: '50vw' }} onHide={() => { if (!visibleDialogContainer) return; setVisibleDialogContainer(false); }}>
                  <form action="" >

                    <div className="item-2 py-4">
                      <label htmlFor="username">Chọn định dạng</label>
                      <FloatLabel>

                        <div className="grid grid-cols-4 gap-4">
                          <div onClick={() => formatColumn(1)} className="item-1 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                          <div onClick={() => formatColumn(2)} className="item-2 flex gap-2 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                          <div onClick={() => formatColumn(3)} className="item-3 flex gap-2 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                          <div onClick={() => formatColumn(4)} className="item-4 flex gap-2 border border-solid w-fit p-2">
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                            <div className="w-4 h-4 border-2 border-dashed">
                            </div>
                          </div>
                        </div>
                      </FloatLabel>
                    </div>
                    <div className="item-3 py-4">
                      <Button className="bg-green-400 p-2 text-white" label="Save" />
                    </div>

                  </form>
                </Dialog>
              </div>
              <div className="card flex justify-content-center border-2 px-4 py-8 rounded-md">
                <Button label="HTML" icon="pi pi-external-link" onClick={() => setVisibleDialogHeading(true)} />
                <Dialog header="Headding" visible={visibleDialogHeading} style={{ width: '50vw' }} onHide={() => { if (!visibleDialogHeading) return; setVisibleDialogHeading(false); }}>
                  <form action="" onSubmit={renderItemHTML}>
                    <div className="item-1 py-4">
                      <label htmlFor="username">Headding</label>
                      <FloatLabel>
                        <InputText className="p-2 w-full" id="username" value={value} onChange={(e) => setValue(e.target.value)} />

                      </FloatLabel>
                    </div>
                    <div className="item-2 py-4">
                      <label htmlFor="username">Position</label>
                      <FloatLabel>

                        <div className="grid grid-cols-3 gap-4">
                          <div onClick={() => positionItem("left")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderLeft && ("border-red-400")}`}>
                            <i className="pi pi-align-left text-xl" />
                          </div>
                          <div onClick={() => positionItem("center")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderCenter && ("border-red-400")}`}>
                            <i className="pi pi-align-center text-xl" />
                          </div>
                          <div onClick={() => positionItem("right")} className={`border-2 border-solid w-fit px-2 rounded-md ${isBorderRight && ("border-red-400")}`}>
                            <i className="pi pi-align-right text-xl" />
                          </div>
                        </div>
                      </FloatLabel>
                    </div>
                    <div className="item-3 py-4">
                      <Button className="bg-green-400 p-2 text-white" label="Save" />
                    </div>

                  </form>
                </Dialog>
              </div>

            </div>
          </Sidebar>
          <Button icon="pi pi-pen-to-square" label="Editor" className="p-2 border-2 border-dashed" onClick={() => setVisible(true)} />

        </div>
        {selectedNodePos !== null && (
          <div className="mt-4">
            Width:
            <input
              type="text"
              value={widthItem}
              onChange={(e) => {
                const newWidth = e.target.value;
                setWidthItem(newWidth);
                updateWidth(newWidth);
              }}
              className="border p-2"
            />
          </div>
        )}

      </div>
      <div className="w-3/4  p-4 h-screen">
        <div>Hiện thị mẫu form</div>
        <div className="flex flex-wrap bg-white items-center p-3 gap-2 my-4">
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="H1"><Heading1 size={18} /></button>
          <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="H2"><Heading2 size={18} /></button>
          <button onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold"><Bold size={18} /></button>
          <button onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic"><Italic size={18} /></button>
          <button onClick={() => editor?.chain().focus().toggleUnderline().run()} title="Underline"><Underline size={18} /></button>
          <button onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strike"><Strikethrough size={18} /></button>
          <button onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet List"><List size={18} /></button>
          <button onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Ordered List"><ListOrdered size={18} /></button>
          <button onClick={() => editor?.chain().focus().setTextAlign('left').run()} title="Left"><AlignLeft size={18} /></button>
          <button onClick={() => editor?.chain().focus().setTextAlign('center').run()} title="Center"><AlignCenter size={18} /></button>
          <button onClick={() => editor?.chain().focus().setTextAlign('right').run()} title="Right"><AlignRight size={18} /></button>
          <button onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear"><Eraser size={18} /></button>
          <button onClick={() => setShowTableModal(true)} title="Table"><Table2 size={18} /></button>
        </div>
        <EditorContent editor={editor}
          className="editor border p-4 rounded bg-white min-h-[500px]" />
                <button className="bg-green-400 p-2 mt-4 text-white" onClick={saveForm}>Lưu đơn</button>

      </div>
    </div>
  );
}
