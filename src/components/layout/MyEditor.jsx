import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const MyEditor = () => {
  const [content, setContent] = useState('');

  return (
    <div className="p-4">
      <CKEditor
        editor={ClassicEditor}
        data="<p>Soạn thảo văn bản tại đây...</p>"
        onChange={(event, editor) => {
          const data = editor.getData();
          setContent(data);
        }}
      />
      <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded" onClick={() => console.log(content)}>
        Lấy nội dung
      </button>
    </div>
  );
};

export default MyEditor;
