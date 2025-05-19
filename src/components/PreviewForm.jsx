import React from "react";

function PreviewForm({ html }) {
  return (

   <div className="mt-4">
      <h4 className="font-semibold">Xem trước:</h4>
      <div
        className="ql-container ql-editor ql-snow p-4 border rounded bg-gray-50"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>

  );
}

export default PreviewForm;