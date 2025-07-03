import React from 'react'

const PrintLayout = ({ html }) => {
    return (
      <div
        id="print-area"
        className="relative w-[800px] h-[1100px] bg-white text-black text-[14px] p-8"
      >
        <div
          className="absolute inset-0 whitespace-pre-wrap font-mono"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  };

export default PrintLayout