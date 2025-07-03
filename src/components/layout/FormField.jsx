import React, { useState, useEffect } from 'react';
import '../../assets/scss/Template.scss';

const FormField = ({ label: initialLabel, type = 'text', width = '50%', onUpdate, initialValue }) => {
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [label, setLabel] = useState(initialLabel || 'Label');
  const [value, setValue] = useState(initialValue || '');

  useEffect(() => {
    setValue(initialValue || '');
  }, [initialValue]);

  useEffect(() => {
    setLabel(initialLabel || 'Label');
  }, [initialLabel]);

  const handleValueBlur = () => {
    setIsEditingValue(false);
    if (onUpdate) onUpdate({ label, value });
  };

  const handleLabelBlur = () => {
    setIsEditingLabel(false);
    if (onUpdate) onUpdate({ label, value });
  };

  return (
    <div className="form-field" style={{ width }}>
      <div className="form-label">
        {isEditingLabel ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleLabelBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            className="form-input form-label-editable"
            autoFocus
          />
        ) : (
          <span className='form-label' onClick={() => setIsEditingLabel(true)}>{label || 'Chưa có nhãn'}:</span>
        )}
      {isEditingValue ? (
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleValueBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          className="form-input"
          autoFocus
        />
      ) : (
        <span className="form-value" onClick={() => setIsEditingValue(true)}>
          {value || 'Chưa có nội dung'}
        </span>
      )}
      </div>
    </div>
  );
};

export default FormField;
