import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Content from './Content';
import '../../assets/scss/Template.scss';

const DraggableCanvas = ({ items }) => {
  const canvasRef = useRef(null);
  // console.log("Dữ liệu đã nhận",items);
  

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

  const handlePrint = () => {
    if (!canvasRef.current) {
      toast.error('Canvas chưa sẵn sàng, vui lòng thử lại!');
      return;
    }
    if (!items || items.length === 0) {
      toast.warn('Canvas trống, hãy thêm item trước khi in!');
      return;
    }
    generatePDF();
  };

  const handleDownloadPdf = async () => {
    if (!canvasRef.current) {
      toast.error('Canvas chưa sẵn sàng, vui lòng thử lại!');
      return;
    }
    if (!items || items.length === 0) {
      toast.warn('Canvas trống, hãy thêm item trước khi tải!');
      return;
    }

    const canvas = await html2canvas(canvasRef.current, {
      scale: 2,
    });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [794, 1123],
    });

    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight > 1123 ? 1123 : pdfHeight);
    pdf.save('canvas.pdf');
    toast.success('Tải PDF thành công!');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="w-full md:w-64 space-y-4">
        <button
          onClick={handlePrint}
          className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 transition"
        >
          In Canvas
        </button>
        <button
          onClick={handleDownloadPdf}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Tải PDF
        </button>
      </div>

      <div
        id="canvas"
        ref={canvasRef}
        className="canvas w-[794px] h-[1123px] bg-white border border-gray-200 rounded-lg shadow-lg flex relative"
      >
        <Content
          items={items}
          canvasRef={canvasRef}
          isEditable={false}
        />
      </div>

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