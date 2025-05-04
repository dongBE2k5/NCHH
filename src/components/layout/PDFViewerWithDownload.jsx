// src/components/PDFViewerWithDownload.jsx
import React from 'react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import MyDocument from './MyDocument';

const PDFViewerWithDownload = ({ formData }) => {
  const handleDownload = async () => {
    const blob = await pdf(<MyDocument data={formData} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'don_xin_xac_nhan.pdf';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <PDFViewer width="600" height="800" style={{ border: '1px solid #ccc' }}>
        <MyDocument data={formData} />
      </PDFViewer>
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Tải PDF
      </button>
    </div>
  );
};

export default PDFViewerWithDownload;
