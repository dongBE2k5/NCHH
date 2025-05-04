// src/components/Sidebar.js
import React from 'react';

const Sidebar = ({ onAddItem }) => {
  return (
    <div className="sidebar w-[171px] h-[1123px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex flex-col space-y-3">
      <button
        type="button"
        onClick={() => onAddItem('nationalTitle')}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Quốc hiệu
      </button>
      <button
        type="button"
        onClick={() => onAddItem('input')}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Input
      </button>
      <button
        type="button"
        onClick={() => onAddItem('textarea')}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Textarea
      </button>
      <button
        type="button"
        onClick={() => onAddItem('dynamicGrid')}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Bảng
      </button>
      <button
        type="button"
        onClick={() => onAddItem('formField')}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Cột học sinh
      </button>
      <button
        type="button"
        onClick={() => onAddItem('studentForm')}
        className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Form học sinh
      </button>
    </div>
  );
};

export default Sidebar;
