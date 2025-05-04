import React from 'react';
import DynamicGrid from './DynamicGrid';
import StudentForm from './StudentForm';
import FormField from './FormField';
import Title from './Title';

const Content = ({
  items,
  setItems,
  canvasRef,
  handleDragItemStart,
  handleDragItemEnd,
  handleChange,
  handleUpdate,
  handleDeleteItem,
  isEditable = true, // Mặc định là true để hỗ trợ chỉnh sửa trong Template
}) => {
  return (
    <div className="content" style={{ width: '623px', position: 'relative' }}>
      <div className="title">
        <h1>Tên Đơn</h1>
      </div>
      {(!items || items.length === 0) ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          Canvas trống. Vui lòng thêm các phần tử.
        </div>
      ) : (
        items.map((item) => {
          const handleDelete = handleDeleteItem ? () => handleDeleteItem(item.id) : null;

          if (item.type === 'nationalTitle') {
            return (
              <div
                key={item.id}
                draggable={isEditable}
                onDragStart={isEditable && handleDragItemStart ? (e) => handleDragItemStart(item.id, e) : undefined}
                onDragEnd={isEditable && handleDragItemEnd ? handleDragItemEnd : undefined}
                className={`nationalTitle absolute ${isEditable ? 'cursor-grab relative group' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px` }}
              >
                <h2>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
                <h4>Độc lập - Tự do - Hạnh phúc</h4>
                {isEditable && handleDelete && (
                  <button
                    onClick={handleDelete}
                    className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-400 hover:text-gray-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          } else if (item.type === 'input') {
            return (
              <div
                key={item.id}
                className={`absolute ${isEditable ? 'relative group' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px` }}
              >
                <input
                  type="text"
                  value={item.value || ''}
                  onChange={isEditable && handleChange ? (e) => handleChange(item.id, e) : undefined}
                  readOnly={!isEditable}
                  draggable={isEditable}
                  onDragStart={isEditable && handleDragItemStart ? (e) => handleDragItemStart(item.id, e) : undefined}
                  onDragEnd={isEditable && handleDragItemEnd ? handleDragItemEnd : undefined}
                  className={`w-48 h-12 bg-blue-600 text-white text-center text-base font-medium border-none outline-none rounded-md shadow-sm ${isEditable ? 'cursor-grab hover:bg-blue-700 transition' : ''}`}
                />
                {isEditable && handleDelete && (
                  <button
                    onClick={handleDelete}
                    className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-400 hover:text-gray-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          } else if (item.type === 'textarea') {
            return (
              <div
                key={item.id}
                className={`absolute ${isEditable ? 'relative group' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px` }}
              >
                <textarea
                  value={item.value || ''}
                  onChange={isEditable && handleChange ? (e) => handleChange(item.id, e) : undefined}
                  readOnly={!isEditable}
                  draggable={isEditable}
                  onDragStart={isEditable && handleDragItemStart ? (e) => handleDragItemStart(item.id, e) : undefined}
                  onDragEnd={isEditable && handleDragItemEnd ? handleDragItemEnd : undefined}
                  className={`w-48 h-24 bg-blue-600 text-white text-base font-medium border-none outline-none rounded-md shadow-sm p-2 ${isEditable ? 'cursor-grab hover:bg-blue-700 transition resize-y' : ''}`}
                />
                {isEditable && handleDelete && (
                  <button
                    onClick={handleDelete}
                    className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-400 hover:text-gray-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          } else if (item.type === 'dynamicGrid') {
            return (
              <div
                key={item.id}
                draggable={isEditable}
                onDragStart={isEditable && handleDragItemStart ? (e) => handleDragItemStart(item.id, e) : undefined}
                onDragEnd={isEditable && handleDragItemEnd ? handleDragItemEnd : undefined}
                className={`absolute border border-gray-300 rounded-lg p-2 bg-gray-50 ${isEditable ? 'cursor-grab relative group' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px`, width: '623px' }}
              >
                <DynamicGrid
                  id={item.id}
                  rows={item.rows}
                  columns={item.columns}
                  columnRatios={item.columnRatios}
                  nestedConfig={item.nestedConfig}
                  onUpdate={isEditable && handleUpdate ? handleUpdate : undefined}
                  initialValue={item.value || {}}
                />
                {isEditable && handleDelete && (
                  <button
                    onClick={handleDelete}
                    className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-400 hover:text-gray-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          } else if (item.type === 'formField') {
            return (
              <div
                key={item.id}
                draggable={isEditable}
                onDragStart={isEditable && handleDragItemStart ? (e) => handleDragItemStart(item.id, e) : undefined}
                onDragEnd={isEditable && handleDragItemEnd ? handleDragItemEnd : undefined}
                className={`absolute contentStudent ${isEditable ? 'cursor-grab relative group' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px`, width: '623px' }}
              >
                <FormField
                  id={item.id}
                  label={item.label}
                  width={item.width}
                  onUpdate={isEditable && handleUpdate ? (data) => handleUpdate(item.id, data) : undefined}
                  initialValue={item.value || ''}
                />
                {isEditable && handleDelete && (
                  <button
                    onClick={handleDelete}
                    className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-400 hover:text-gray-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          } else if (item.type === 'studentForm') {
            return (
              <div
                key={item.id}
                draggable={isEditable}
                onDragStart={isEditable && handleDragItemStart ? (e) => handleDragItemStart(item.id, e) : undefined}
                onDragEnd={isEditable && handleDragItemEnd ? handleDragItemEnd : undefined}
                className={`studentForm-wrapper relative group`}
                style={{ left: `${item.left}px`, top: `${item.top}px` }}
              >
                <StudentForm
                  id={item.id}
                  onUpdate={isEditable && handleUpdate ? handleUpdate : undefined}
                  isEditable={isEditable}
                  items={item.value}
                />
                {isEditable && handleDelete && (
                  <button
                    onClick={handleDelete}
                    className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-400 hover:text-gray-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          } else if (item.type === 'title') {
            return (
              <div
                key={item.id}
                draggable={isEditable}
                onDragStart={isEditable && handleDragItemStart ? (e) => handleDragItemStart(item.id, e) : undefined}
                onDragEnd={isEditable && handleDragItemEnd ? handleDragItemEnd : undefined}
                className={`absolute ${isEditable ? 'cursor-grab relative group' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px`, width: '623px' }}
              >
                <Title
                  id={item.id}
                  type="text"
                  width="100%"
                  onUpdate={isEditable && handleUpdate ? (data) => handleUpdate(item.id, data) : undefined}
                  initialValue={item.value}
                />
                {isEditable && handleDelete && (
                  <button
                    onClick={handleDelete}
                    className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-400 hover:text-gray-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          }
          return null;
        })
      )}
    </div>
  );
};

export default Content;