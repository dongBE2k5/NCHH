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
const autoResizeHeight = (e) => {
  const el = e.target;
  el.style.height = 'auto'; // reset height để tính đúng scrollHeight
  el.style.height = el.scrollHeight + 'px'; // set height bằng scrollHeight
};




  const autoResizeWith = (e) => {
    e.target.style.width = 'auto';
    const width = Math.min(Math.max(e.target.scrollWidth, 100), 623);
    e.target.style.width = `${width}px`;
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };


  return (
    <div className="content  border border-transparent hover:border-gray-400 focus:border-gray-500 focus:outline-none" style={{ width: '623px', position: 'relative' }}>

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
                    type="button"
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
                className={`absolute ${isEditable ? 'group' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px` }}
              >
                <input
                  onKeyDown={handleKeyDown}
                  type="text"
                  onInput={autoResizeWith}
                  maxLength={89}
                  value={item.value || ''}
                  onChange={isEditable && handleChange ? (e) => handleChange(item.id, e) : undefined}
                  readOnly={!isEditable}
                  draggable={isEditable}
                  onDragStart={isEditable && handleDragItemStart ? (e) => handleDragItemStart(item.id, e) : undefined}
                  onDragEnd={isEditable && handleDragItemEnd ? handleDragItemEnd : undefined}
                  className={`w-auto ${isEditable ? 'cursor-grab border border-transparent hover:border-gray-400 focus:border-gray-500 focus:outline-none' : ''}`}
                />
                {isEditable && handleDelete && (
                  <button
                    type="button"
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
                className={`absolute ${isEditable ? 'group' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px` }}
              >
                <textarea
                  rows={1}
                  onInput={autoResizeHeight}
                  value={item.value || ''}
                  onChange={isEditable && handleChange ? (e) => handleChange(item.id, e) : undefined}
                  readOnly={!isEditable}
                  draggable={isEditable}
                  onDragStart={isEditable && handleDragItemStart ? (e) => handleDragItemStart(item.id, e) : undefined}
                  onDragEnd={isEditable && handleDragItemEnd ? handleDragItemEnd : undefined}
                  className={`transition resize-y px-2 py-1 rounded  indent-6 ${isEditable
                    ? 'cursor-grab border border-transparent hover:border-gray-400 focus:border-gray-500 focus:outline-none'
                    : ''
                    }`}
                />
                {isEditable && handleDelete && (
                  <button
                    type="button"
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
                className={` dynamicGrid absolute  ${isEditable ? 'cursor-grab relative group' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px` }}
              >
                <DynamicGrid
                  id={item.id}
                  rows={item.rows}
                  columns={item.columns}
                  columnRatios={item.columnRatios}
                  nestedConfig={item.nestedConfig}
                  onUpdate={isEditable && handleUpdate ? handleUpdate : undefined}
                  initialValue={item.data || {}}
                />
                {isEditable && handleDelete && (
                  <button
                    type="button"
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
                className={`absolute ${isEditable ? 'cursor-grabgroup' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px` }}
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
                    type="button"
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
                  items={item.data}
                />
                {isEditable && handleDelete && (
                  <button
                    type="button"
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
                    type="button"
                    onClick={handleDelete}
                    className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-400 hover:text-gray-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          }
          else if (item.type === 'signature') {
            return (
              <div
                key={item.id}
                draggable={isEditable}
                onDragStart={isEditable && handleDragItemStart ? (e) => handleDragItemStart(item.id, e) : undefined}
                onDragEnd={isEditable && handleDragItemEnd ? handleDragItemEnd : undefined}
                className={`signature absolute ${isEditable ? 'cursor-grab group' : ''}`}
                style={{ left: `${item.left}px`, top: `${item.top}px` }}
              >

                <h3>Người làm đơn</h3>
                <h4>(Ký và ghi rõ họ tên)</h4>


                {isEditable && handleDelete && (
                  <button
                    type="button"
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