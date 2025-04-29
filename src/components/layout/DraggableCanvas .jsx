import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';

const DraggableCanvas = () => {
  const canvasRef = useRef(null);
  const [items, setItems] = useState([]);

  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('text/plain', type);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    const type = e.dataTransfer.getData('text/plain');
    if (type === 'new-item' || type === 'new-textarea') {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newItem = {
        id: Date.now(),
        type: type === 'new-item' ? 'input' : 'textarea',
        left: e.clientX - canvasRect.left - 100,
        top: e.clientY - canvasRect.top - 25,
        value: type === 'new-item' ? 'Item' : 'Textarea',
        className: e.target.className,
      };
      setItems((prevItems) => [...prevItems, newItem]);
    }
  };

  const handleDragItem = (id, e) => {
    
    
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          left: e.clientX - canvasRect.left - 100,
          top: e.clientY - canvasRect.top - 25,
        };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleChange = (id, e) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        return { ...item, value: e.target.value };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const generatePDF = useReactToPrint({
    contentRef: canvasRef,
    documentTitle: 'Canvas',
    onAfterPrint: () => toast.success('In thành công!'),
    onPrintError: () => toast.error('In thất bại, vui lòng thử lại!'),
  });

  const handlePrint = () => {
    if (!canvasRef.current) {
      toast.error('Canvas chưa sẵn sàng, vui lòng thử lại!');
      return;
    }
    if (items.length === 0) {
      toast.warn('Canvas trống, hãy thêm item trước khi in!');
      return;
    }
    generatePDF();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const postData = { items };
    console.log(postData);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Sidebar trái: Mẫu kéo và nút in */}
      <div className="w-full md:w-64 space-y-4">
        <div
          id="template-input"
          draggable
          onDragStart={(e) => handleDragStart(e, 'new-item')}
          className="w-full h-12 bg-orange-600 text-white text-center leading-12 font-medium rounded-lg shadow-md hover:bg-orange-700 cursor-grab select-none transition"
        >
          Mẫu Input
        </div>
        <div
          id="template-textarea"
          draggable
          onDragStart={(e) => handleDragStart(e, 'new-textarea')}
          className="w-full h-12 bg-orange-500 text-white text-center leading-12 font-medium rounded-lg shadow-md hover:bg-orange-600 cursor-grab select-none transition"
        >
          Mẫu Textarea
        </div>
        <button
          onClick={handlePrint}
          className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition"
        >
          In Canvas
        </button>
      </div>

      {/* Khu vực phải: Form và Canvas */}
      <form onSubmit={handleSubmit} className="w-full space-y-4 flex flex-col items-center">
        <div
          id="canvas"
          ref={canvasRef}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="w-[794px] h-[1123px] bg-white border border-gray-200 rounded-lg shadow-lg relative"
        >
          {items.map((item) => (
            item.type === 'input' ? (
              <input
                key={item.id}
                type="text"
                value={item.value}
                onChange={(e) => handleChange(item.id, e)}
                draggable
                onDrag={(e) => handleDragItem(item.id, e)}
                className="absolute w-48 h-12 bg-blue-600 text-white text-center text-base font-medium border-none outline-none rounded-md shadow-sm cursor-grab hover:bg-blue-700 transition"
                style={{
                  left: `${item.left}px`,
                  top: `${item.top}px`,
                }}
              />
            ) : (
              <textarea
                key={item.id}
                value={item.value}
                onChange={(e) => handleChange(item.id, e)}
                draggable
                onDrag={(e) => handleDragItem(item.id, e)}
                className="absolute w-48 h-24 bg-blue-600 text-white text-base font-medium border-none outline-none rounded-md shadow-sm cursor-grab hover:bg-blue-700 transition resize-y p-2"
                style={{
                  left: `${item.left}px`,
                  top: `${item.top}px`,
                }}
              />
            )
          ))}
        </div>
        <button
          type="submit"
          className="w-full md:w-64 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          Tạo mới
        </button>
      </form>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          #canvas {
            width: 794px;
            height: 1123px;
            background: white !important;
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            box-sizing: border-box;
            page-break-after: always;
          }
          input, textarea {
            background: #2563eb !important;
            color: white !important;
            border: none !important;
            box-shadow: none !important;
          }
          button, .md\\:w-64, .bg-gray-50 {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DraggableCanvas;