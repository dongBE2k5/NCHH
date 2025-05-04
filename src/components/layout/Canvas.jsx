// src/components/Canvas.js
import React from 'react';
import DynamicGrid from './DynamicGrid';
import FormField from './FormField';
import StudentForm from './StudentForm';

const Canvas = ({ items, onDragItem, onChangeItem, onDropItem, onDragOver, canvasRef }) => {
  return (
    <div
      id="canvas"
      ref={canvasRef}
      onDragOver={onDragOver}
      onDrop={onDropItem}
      className="canvas w-[794px] h-[1123px] bg-white border border-gray-200 rounded-lg shadow-lg flex"
    >
      <div className="content" style={{ width: '623px', position: 'relative' }}>
        <div className="title">
          <h1>Tên Đơn</h1>
        </div>

        {items.map((item) => {
          const style = { left: `${item.left}px`, top: `${item.top}px` };

          switch (item.type) {
            case 'nationalTitle':
              return (
                <div
                  key={item.id}
                  draggable
                  onDrag={(e) => onDragItem(item.id, e)}
                  className="nationalTitle absolute cursor-grab"
                  style={style}
                >
                  <h2>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
                  <h4>Độc lập - Tự do - Hạnh phúc</h4>
                </div>
              );
            case 'input':
              return (
                <input
                  key={item.id}
                  type="text"
                  value={item.value}
                  onChange={(e) => onChangeItem(item.id, e)}
                  draggable
                  onDrag={(e) => onDragItem(item.id, e)}
                  className="absolute w-48 h-12 bg-blue-600 text-white text-center text-base font-medium border-none outline-none rounded-md shadow-sm cursor-grab hover:bg-blue-700 transition"
                  style={style}
                />
              );
            case 'textarea':
              return (
                <textarea
                  key={item.id}
                  value={item.value}
                  onChange={(e) => onChangeItem(item.id, e)}
                  draggable
                  onDrag={(e) => onDragItem(item.id, e)}
                  className="absolute w-48 h-24 bg-blue-600 text-white text-base font-medium border-none outline-none rounded-md shadow-sm cursor-grab hover:bg-blue-700 transition resize-y p-2"
                  style={style}
                />
              );
            case 'dynamicGrid':
              return (
                <div
                  key={item.id}
                  draggable
                  onDrag={(e) => onDragItem(item.id, e)}
                  className="absolute cursor-grab border border-gray-300 rounded-lg p-2 bg-gray-50"
                  style={{ ...style, width: '623px' }}
                >
                  <DynamicGrid
                    rows={item.rows}
                    columns={item.columns}
                    columnRatios={item.columnRatios}
                    nestedConfig={item.nestedConfig}
                  />
                </div>
              );
            case 'formField':
              return (
                <div
                  key={item.id}
                  draggable
                  onDrag={(e) => onDragItem(item.id, e)}
                  className="absolute cursor-grab contentStudent"
                  style={{ ...style, width: '623px' }}
                >
                  <FormField label={item.label} width={item.width} />
                </div>
              );
            case 'studentForm':
              return (
                <div
                  key={item.id}
                  draggable
                  onDrag={(e) => onDragItem(item.id, e)}
                  className="studentForm-wrapper absolute cursor-grab"
                  style={style}
                >
                  <StudentForm />
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
};

export default Canvas;
