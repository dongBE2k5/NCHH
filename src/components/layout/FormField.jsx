import React, { useState, useEffect } from 'react';
import '../../assets/scss/Template.scss';

const FormField = ({ label, type = 'text', width = '50%', onUpdate, initialValue }) => {
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
    <div className="form-field" style={{ width }}>
      <label className="form-label" onClick={handleClick}>
        {label}:
        {isEditing ? (
          <input
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            type={type}
            value={value}
            className="form-input"
            onBlur={handleBlur}
            onChange={handleChange}
          />
        ) : (
          <span className="form-value">{value || 'Chưa có nội dung'}</span>
        )}
      </label>
    </div>
  );
};

export default FormField;