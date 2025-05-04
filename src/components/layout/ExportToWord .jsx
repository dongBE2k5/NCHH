import React, { useRef } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

const ExportToWord = () => {
  const contentRef = useRef();

  const convertElementToParagraphs = (element) => {
    const tag = element.tagName?.toLowerCase();

    // Nếu là text node
    if (element.nodeType === 3) {
      const text = element.textContent.trim();
      return text ? [new Paragraph(text)] : [];
    }

    // Nếu là input
    if (tag === 'input') {
      const value = element.value || element.placeholder || '[Chưa nhập]';
      return [new Paragraph({ children: [new TextRun(`• ${value}`)] })];
    }

    const text = element.textContent.trim();
    switch (tag) {
      case 'h1':
        return [new Paragraph({ text, heading: HeadingLevel.HEADING_1 })];
      case 'h2':
        return [new Paragraph({ text, heading: HeadingLevel.HEADING_2 })];
      case 'h3':
        return [new Paragraph({ text, heading: HeadingLevel.HEADING_3 })];
      case 'p':
      case 'span':
      case 'label':
        return [new Paragraph(text)];
      case 'div': {
        const children = Array.from(element.childNodes);
        const allParagraphs = children.flatMap((child) =>
          convertElementToParagraphs(child)
        );
        return allParagraphs;
      }
      default:
        return text ? [new Paragraph(text)] : [];
    }
  };

  const handleExport = async () => {
    const root = contentRef.current;
    const allParagraphs = Array.from(root.childNodes).flatMap((el) =>
      convertElementToParagraphs(el)
    );

    const doc = new Document({ sections: [{ children: allParagraphs }] });
    const blob = await Packer.toBlob(doc);

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'document.docx';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div>
      <div ref={contentRef}>
        <h1>Tiêu đề lớn</h1>
        <h2>Tiêu đề nhỏ</h2>
        <p>Đây là đoạn văn bản mẫu để xuất ra file Word.</p>

        <label>Email:</label> <input type="text" placeholder="Nhập email" /><br />
        <label>Điện thoại:</label> <input type="text" placeholder="Nhập SĐT" /><br />

        <div>
          <span>Thông tin bổ sung:</span>
          <p>Nội dung bên trong div</p>
        </div>
      </div>

      <button
        onClick={handleExport}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Xuất Word
      </button>
    </div>
  );
};

export default ExportToWord;
