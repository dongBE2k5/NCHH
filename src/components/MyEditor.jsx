// MyEditor.jsx
import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';


const MyEditor = () => {
    const [data, setData] = useState('');

    return (
        <div className="App">
            <h2>CKEditor 5 in React</h2>
            <CKEditor
                editor={ClassicEditor}
                data="<p>Hello from CKEditor 5!</p>"
                onChange={(event, editor) => {
                    const data = editor.getData();
                    setData(data);
                    console.log({ event, editor, data });
                }}
            />
            <div style={{ marginTop: 20 }}>
                <strong>Nội dung đã nhập:</strong>
                <div dangerouslySetInnerHTML={{ __html: data }} />
            </div>
        </div>
    );
};

export default MyEditor;
