import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../../assets/scss/Template.scss';
import DynamicGrid from './DynamicGrid';
import StudentForm from './StudentForm';
import FormField from './FormField';
import Title from './Title';
import Content from './Content';

const Template = ({ items, setItems, onCreateNew,setPosts  }) => {
  const canvasRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [gridConfig, setGridConfig] = useState({
    rows: 3,
    columns: 2,
    columnRatios: '',
    nestedConfig: '',
  });
  const [dragStartPos, setDragStartPos] = useState(null);

  if (!setItems || typeof setItems !== 'function') {
    console.error('setItems không phải là hàm:', setItems);
    return <div>Lỗi: setItems không được truyền đúng.</div>;
  }

  const generatePDF = useReactToPrint({
    content: () => canvasRef.current,
    documentTitle: 'Canvas',
    copyStyles: true,
    pageStyle: `
      @page { size: 794px 1123px; margin: 0; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      #canvas { width: 794px !important; height: 1123px !important; }
    `,
    onAfterPrint: () => toast.success('In thành công!'),
    onPrintError: () => toast.error('In thất bại, vui lòng thử lại!'),
  });

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('text/plain', type);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (type === 'new-item' || type === 'new-textarea' || type === 'nationalTitle') {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newLeft = e.clientX - canvasRect.left - 100;
      const newTop = e.clientY - canvasRect.top - 25;
      const newItem = {
        id: Date.now(),
        type: type === 'new-item' ? 'input' : type === 'new-textarea' ? 'textarea' : 'nationalTitle',
        left: Math.max(0, Math.min(newLeft, 623 - 200)),
        top: Math.max(0, Math.min(newTop, 1123 - 50)),
        value: type === 'new-item' ? 'Item' : type === 'new-textarea' ? 'Textarea' : null,
        className: type === 'nationalTitle' ? 'nationalTitle' : '',
      };
      setItems((prevItems) => [...prevItems, newItem]);
    }
  };

  const handleDragItemStart = (id, e) => {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const item = items.find(item => item.id === id);
    setDragStartPos({
      id,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: item.left,
      startTop: item.top,
      type: item.type,
    });
  };

  const handleDragItemEnd = (e) => {
    if (!canvasRef.current || !dragStartPos) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const { id, startX, startY, startLeft, startTop, type } = dragStartPos;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newLeft = startLeft + deltaX;
    let newTop = startTop + deltaY;

    if (type === 'input' || type === 'textarea') {
      newLeft = Math.max(0, Math.min(newLeft, 623 - 192));
      newTop = Math.max(0, Math.min(newTop, 1123 - (type === 'input' ? 48 : 96)));
    } else {
      newLeft = startLeft;
      if (type === 'nationalTitle' || type === 'title') {
        newTop = Math.max(0, Math.min(newTop, 1123 - 50));
      } else {
        newTop = Math.max(0, Math.min(newTop, 1123 - 200));
      }
    }

    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, left: newLeft, top: newTop } : item
    );
    setItems(updatedItems);
    setDragStartPos(null);
  };

  const handleChange = (id, e) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, value: e.target.value } : item
    );
    setItems(updatedItems);
  };

  const handleUpdate = (id, data) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, ...data } : item
    );
    setItems(updatedItems);
  };

  const handleDeleteItem = (id) => {
    setItems((prevItems) => prevItems.filter(item => item.id !== id));
    toast.success('Đã xóa item!');
  };

  const handlePrint = () => {
    if (!canvasRef.current || !items.length) {
      toast.warn('Canvas trống hoặc chưa sẵn sàng, vui lòng thêm item!');
      return;
    }
    generatePDF();
  };

  const handleDownloadPdf = async () => {
    if (!canvasRef.current || !items.length) {
      toast.warn('Canvas trống hoặc chưa sẵn sàng, vui lòng thêm item!');
      return;
    }
    const canvas = await html2canvas(canvasRef.current, { scale: 2 });
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [794, 1123] });
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight > 1123 ? 1123 : pdfHeight);
    pdf.save('canvas.pdf');
    toast.success('Tải PDF thành công!');
  };

  const handleGridConfigChange = (e) => {
    const { name, value } = e.target;
    setGridConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDynamicGrid = () => {
    try {
      const columns = parseInt(gridConfig.columns, 10);
      const columnRatiosArray = gridConfig.columnRatios.trim().split(/\s+/) || Array(columns).fill('5');
      const nestedConfigObj = gridConfig.nestedConfig.trim() ? JSON.parse(gridConfig.nestedConfig) : {};
      const newGridItem = {
        id: Date.now(),
        type: 'dynamicGrid',
        left: 0,
        top: 300,
        rows: parseInt(gridConfig.rows, 10),
        columns,
        columnRatios: columnRatiosArray,
        nestedConfig: nestedConfigObj,
        value: {},
      };
      setItems((prevItems) => [...prevItems, newGridItem]);
      setShowModal(false);
      toast.success('Đã thêm DynamicGrid!');
    } catch (error) {
      toast.error('Lỗi: Kiểm tra định dạng JSON của nestedConfig hoặc tỷ lệ cột!');
    }
  };

  const handleAddFormField = () => {
    const newItem = { id: Date.now(), type: 'formField', label: 'Họ và tên', left: 0, top: 300, width: '100%', value: '' };
    setItems((prevItems) => [...prevItems, newItem]);
    toast.success('Đã thêm FormField!');
  };

  const handleAddStudentForm = () => {
    const newItem = { id: Date.now(), type: 'studentForm', left: 0, top: 300, data: {} };
    setItems((prevItems) => [...prevItems, newItem]);
    toast.success('Đã thêm StudentForm!');
  };

  const handleAddTitle = () => {
    const newItem = { id: Date.now(), type: 'title', left: 0, top: 300, width: '100%', value: 'Nhập tên đơn' };
    setItems((prevItems) => [...prevItems, newItem]);
    toast.success('Đã thêm Title!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!items || items.length === 0) {
      toast.warn('Không có dữ liệu để gửi, vui lòng thêm item!');
      return;
    }

    const postData = {
      items: items.map(item => ({
        ...item,
        value: item.type === 'nationalTitle'
          ? 'CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM - Độc lập - Tự do - Hạnh phúc'
          : item.type === 'studentForm'
          ? item.data
          : item.value,
      })),
    };

    console.log('Dữ liệu gửi đi:', postData.items);




    
    try {
      await onCreateNew(postData.items);
      toast.success('Dữ liệu đã được gửi thành công!');
      setItems([]);
    } catch (error) {
      toast.error(`Gửi dữ liệu thất bại: ${error.message}`);
    }

  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="w-full md:w-64 space-y-4">
        <div
          id="template-nationalTitle"
          draggable
          onDragStart={(e) => handleDragStart(e, 'nationalTitle')}
          className="w-full h-12 bg-purple-600 text-white text-center leading-12 font-medium rounded-lg shadow-md hover:bg-purple-700 cursor-grab select-none"
        >
          Mẫu National Title
        </div>
        <div
          id="template-input"
          draggable
          onDragStart={(e) => handleDragStart(e, 'new-item')}
          className="w-full h-12 bg-orange-600 text-white text-center leading-12 font-medium rounded-lg shadow-md hover:bg-orange-700 cursor-grab select-none"
        >
          Mẫu Input
        </div>
        <div
          id="template-textarea"
          draggable
          onDragStart={(e) => handleDragStart(e, 'new-textarea')}
          className="w-full h-12 bg-orange-500 text-white text-center leading-12 font-medium rounded-lg shadow-md hover:bg-orange-600 cursor-grab select-none"
        >
          Mẫu Textarea
        </div>
        <button onClick={handleAddFormField} className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700">
          Tạo FormField
        </button>
        <button onClick={handleAddStudentForm} className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700">
          Tạo StudentForm
        </button>
        <button onClick={() => setShowModal(true)} className="w-full px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg shadow-md hover:bg-yellow-700">
          Tạo DynamicGrid
        </button>
        <button onClick={handleAddTitle} className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700">
          Tạo Title
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-medium mb-4">Tạo DynamicGrid</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Số hàng:</label>
                <input type="number" name="rows" value={gridConfig.rows} onChange={handleGridConfigChange} className="w-full px-3 py-2 border rounded-lg" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Số cột:</label>
                <input type="number" name="columns" value={gridConfig.columns} onChange={handleGridConfigChange} className="w-full px-3 py-2 border rounded-lg" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Tỷ lệ cột (Ví dụ: 5 5):</label>
                <input type="text" name="columnRatios" value={gridConfig.columnRatios} onChange={handleGridConfigChange} className="w-full px-3 py-2 border rounded-lg" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium">Nested Config:</label>
                <textarea name="nestedConfig" value={gridConfig.nestedConfig} onChange={handleGridConfigChange} className="w-full px-3 py-2 border rounded-lg" rows="4" placeholder="Để trống nếu không cần" />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                Hủy
              </button>
              <button onClick={handleAddDynamicGrid} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-4 flex flex-col items-center">
        <div
          id="canvas"
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="canvas w-[794px] h-[1123px] bg-white border border-gray-200 rounded-lg shadow-lg flex relative"
        >
          <Content
            items={items}
            setItems={setItems}
            canvasRef={canvasRef}
            handleDragItemStart={handleDragItemStart}
            handleDragItemEnd={handleDragItemEnd}
            handleChange={handleChange}
            handleUpdate={handleUpdate}
            handleDeleteItem={handleDeleteItem}
            isEditable={true}
          />
        </div>
        <button
          type="submit"
          className="w-full md:w-64 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Tạo mới
        </button>
      </form>
    </div>
  );
};

export default Template;