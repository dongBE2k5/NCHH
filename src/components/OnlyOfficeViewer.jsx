// src/components/OnlyOfficeViewer.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../service/BaseUrl';


const ONLYOFFICE_SERVER = 'https://documentserver.onlyoffice.com'; // hoặc URL máy chủ bạn tự host

const OnlyOfficeViewer = ({ filename }) => {
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/docx-url/${filename}`)
      .then((res) => setDocUrl(res.data.url))
      .catch((err) => console.error('Lỗi khi lấy URL:', err));
  }, [filename]);

  return (
    <div style={{ height: '100vh' }}>
      {docUrl ? (
        <iframe
          title="OnlyOffice Viewer"
          width="100%"
          height="100%"
          frameBorder="0"
          src={`${ONLYOFFICE_SERVER}/?fileUrl=${encodeURIComponent(docUrl)}`}
        />
      ) : (
        <p>Đang tải tài liệu...</p>
      )}
    </div>
  );
};

export default OnlyOfficeViewer;
