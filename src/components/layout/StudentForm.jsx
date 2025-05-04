import React, { useState, useEffect } from 'react';
import FormField from './FormField';

const StudentForm = ({ id, onUpdate, items}) => {
  const [formData, setFormData] = useState({});

  // Hàm xử lý cập nhật dữ liệu
  const handleFieldUpdate = (fieldKey, data) => {
    const updatedData = { ...formData, [fieldKey]: data.value };
    setFormData(updatedData);

    // Gửi toàn bộ dữ liệu lên component cha mỗi khi cập nhật
    if (onUpdate) {
      onUpdate(id, { data: updatedData });
    }
  };

  useEffect(() => {
    if (items) {
      setFormData(items); // Set the initial form data from the items prop
      console.log("Nhận data", items);
    }
  }, [items]);

  return (
    <div className="contentStudent absolute inset-0">
      <div className="dear flex flex-col md:flex-row gap-6">
        <FormField
          label="Họ và tên"
          width="50%"
          initialValue={formData.name || ''}
          onUpdate={(data) => handleFieldUpdate('name', data)}
        />
        <FormField
          label="Mã số HSSV"
          width="50%"
          initialValue={formData.studentId || ''}
          onUpdate={(data) => handleFieldUpdate('studentId', data)}
        />
      </div>
      <div className="dear flex flex-col md:flex-row gap-6">
        <FormField
          label="Ngày sinh"
          width="50%"
          initialValue={formData.birthDate || ''}
          onUpdate={(data) => handleFieldUpdate('birthDate', data)}
        />
        <FormField
          label="Nơi sinh"
          width="50%"
          initialValue={formData.birthPlace || ''}
          onUpdate={(data) => handleFieldUpdate('birthPlace', data)}
        />
      </div>
      <div className="dear flex flex-col md:flex-row gap-6">
        <FormField
          label="Lớp"
          width="50%"
          initialValue={formData.class || ''}
          onUpdate={(data) => handleFieldUpdate('class', data)}
        />
        <FormField
          label="Ngành"
          width="50%"
          initialValue={formData.major || ''}
          onUpdate={(data) => handleFieldUpdate('major', data)}
        />
      </div>
    </div>
  );
};
<style>{`
 .contentStudent{
 inset:0 !important;
 }
`}</style>
export default StudentForm;