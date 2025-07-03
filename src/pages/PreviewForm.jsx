import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import 'react-quill/dist/quill.snow.css';

const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD") // Tách dấu khỏi ký tự gốc
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, " ") // Xóa khoảng trắng thừa
    .trim()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // PascalCase
    .join("");
};


function PreviewForm() {
  const { formID, id } = useParams();
  const [html, setHtml] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [detailRes, valueRes] = await Promise.all([
          fetch(`http://nckh.local/api/forms/${formID}`),
          fetch(`http://nckh.local/api/preview-form/${id}`)
        ]);

        if (!detailRes.ok || !valueRes.ok) throw new Error("Lỗi khi fetch dữ liệu");

        const detailData = await detailRes.json();
        const valueData = await valueRes.json();

        const formModelHtml = detailData["form-model"] || "Không có dữ liệu";
        const fieldForms = detailData["field_form"] || [];
        const values = valueData.values || [];

        // Tạo map từ field_id -> label không dấu
        const fieldIdToLabel = {};
        fieldForms.forEach(field => {
          const label = field.label;
          fieldIdToLabel[field.id] = removeVietnameseTones(label);
          console.log("fieldIdToLabel: " + JSON.stringify(fieldIdToLabel));
        });

        // Tạo map từ label không dấu -> value
        const labelToValue = {};
        values.forEach(item => {
          const label = fieldIdToLabel[item.field_form_id];
          if (label) {
            labelToValue[label] = item.value;
            console.log("labelToValue: " + JSON.stringify(labelToValue));
          }
        });

        // Replace trong HTML
        let replacedHtml = formModelHtml;
        for (const [key, value] of Object.entries(labelToValue)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          replacedHtml = replacedHtml.replace(regex, value);
          console.log("replacedHtml: " + replacedHtml);
        }

        setHtml(replacedHtml);

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    }

    fetchData();
  }, [id]);
  const handlePrint = () => {
    const content = document.getElementById('print-area').outerHTML;
    const currentDate = new Date().toLocaleDateString("vi-VN");
    const printWindow = window.open('', '', 'width=900,height=1200');
  
    printWindow.document.write(`
      <html>
        <body>
          <div style="text-align:right; margin-bottom: 20px;">Ngày in: ${currentDate}</div>
          ${content}
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="pt-[72px] w-1/2 mx-auto">
      <div className="flex flex-col py-16 ql-snow">
        <h4 className="font-semibold mb-2">Xem trước:</h4>
        <div
          id="print-area"
          className="ql-container w-[822px] ql-editor py-8 px-12 ql-snow border rounded bg-gray-50"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <button
        onClick={handlePrint}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        🖨️ In đơn
      </button>
    </div>

  );
}

export default PreviewForm;
