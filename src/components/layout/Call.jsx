import React, { useState,useRef } from 'react';
import PDFViewerWithDownload from './PDFViewerWithDownload';
import { useReactToPrint } from "react-to-print";

const Call = () => {
    const contentRef = useRef(null);
    const reactToPrintFn = useReactToPrint({ contentRef });

  return (
    <div>
    <button onClick={reactToPrintFn}>Print</button>
    <div ref={contentRef}>Content to print</div>
  </div>
  );
};

export default Call;
