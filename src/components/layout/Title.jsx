import React, { useState, useEffect } from 'react';
import '../../assets/scss/Template.scss';

const Title = ({ type = 'text', width = '50%', onUpdate, initialValue }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue || '');
    // Cập nhật giá trị khi initialValue thay đổi
    useEffect(() => {
        setValue(initialValue || '');
    }, [initialValue]);

    const handleBlur = () => {
        setIsEditing(false);
        if (onUpdate) onUpdate({ value });
        console.log(value);
        console.log(onUpdate);

    };

    const handleChange = (e) => {
        setValue(e.target.value);
    };

    const handleClick = () => {
        setIsEditing(true);
    };

    return (
        <>
            <div className="title"  onClick={handleClick}>
            {isEditing ? (
                    <input
                        type={type}
                        value={value}
                        className="form-input"
                        onBlur={handleBlur}
                        onChange={handleChange}
                    />
                ) : (
                    <h1 >{value || 'Nhập tên đơn'}</h1>
                )}
              
            </div>
            <div className="form-label">

               
            </div>


        </>
    );
};

export default Title;