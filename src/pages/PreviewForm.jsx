import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import 'react-quill/dist/quill.snow.css';


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

        const formModelHtml = detailData["form-model"];
        if (formModelHtml) {
          try {
            const res = await fetch(`http://nckh.local/api/docx-to-html/${formModelHtml}`);
            const data = await res.json();
            console.log("data", data);
            const fieldForms = detailData["field_form"] || [];
            const values = valueData.values || [];
            console.log("fieldForms", fieldForms);
            console.log("values", values);
            const mergedData = values.map(item => {
              const field = fieldForms.find(f => f.id === item.field_form_id);
              return {
                key: field?.key || '',
                value: item.value
              };
            });
            console.log("mergedData", mergedData);
            const finalHtml = replaceVariables(data.html, mergedData);

            setHtml(finalHtml);
          } catch (err) {
            console.error("Lỗi khi đọc đơn:", err);
          }
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    }

    const replaceVariables = (htmlString, mergedData) => {
      let newHtml = htmlString;

      mergedData.forEach(({ key, value }) => {
        const pattern = new RegExp(`\\{${key}\\}`, 'g');
        newHtml = newHtml.replace(pattern, value);
      });

      return newHtml;
    };

    fetchData();

  }, [id]);
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>In đơn</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              .form-model { max-width: 800px; margin: auto; text-align: left; }
              .form-model p { text-align: revert-layer !important; }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            <div class="form-model">
              ${html}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };
  
  

  return (
    <div className="pt-[72px] w-1/2 mx-auto">
      <div className="flex flex-col  ql-snow  py-16">
        <h4 className="font-semibold mb-2">Xem trước:</h4>
        <div className='w-full h-full bg-white p-8 rounded-lg shadow-md '>
          <div className='form-model overflow-hidden' dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
      <button
        onClick={handlePrint}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        In đơn
      </button>
    </div>
  );
}

export default PreviewForm;
