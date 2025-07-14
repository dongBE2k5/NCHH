import React, { useState } from 'react';

const UploadTemplate = () => {
    const [variables, setVariables] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await fetch('http://localhost:4000/extract-variables', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                console.log("Lỗi");
                
                throw new Error(text || 'Lỗi không xác định');
            }
            const data = await res.json();
            setVariables(data.variables || []);
        } catch (err) {
            alert('Lỗi khi gửi file: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 500, margin: '30px auto' }}>
            <h2>Upload file .docx để hiển thị biến</h2>
            <input type="file" accept=".docx" onChange={handleFileChange} />
            {loading && <p>Đang xử lý...</p>}
            {variables.length > 0 && (
                <div>
                    <h4>Các biến tìm thấy:</h4>
                    <ul>
                        {variables.map((v, i) => (
                            <li key={i}>{v}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UploadTemplate;
