import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';

// Mock API function for student ID validity check
// In a real application, this would be an actual API call.
const checkStudentIdValidity = (studentId) => {
    // This mock list should come from a centralized source in a real app
    const mockValidStudentIds = [
        "20510001",
        "20510002",
        "20510003",
        "20510004",
        "20510005"
    ];
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockValidStudentIds.includes(studentId.toUpperCase()));
        }, 300); // Simulate network delay
    });
};

const GenericForm = ({ formConfig, onPrintSubmit }) => {
    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState(null);

    useEffect(() => {
        // Reset form data and errors when formConfig changes (i.e., new template selected)
        const initialData = {};
        formConfig.fields.forEach(field => {
            initialData[field.name] = '';
            if (field.type === 'number' && field.min) {
                initialData[field.name] = field.min; // Set default for number inputs
            }
            if (field.type === 'select' && field.options && field.options.length > 0) {
                initialData[field.name] = field.options[0]; // Set default for select inputs
            }
        });
        setFormData(initialData);
        setFormErrors({});
        setSubmissionError(null);
    }, [formConfig]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for the field as user types
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = async () => {
        const errors = {};
        let isValid = true;

        for (const field of formConfig.fields) {
            const value = formData[field.name];

            // Required fields validation
            if (field.required && (!value === null || value.trim() === '')) {
                errors[field.name] = `${field.label} không được để trống.`;
                isValid = false;
            }

            // Specific validation for 'studentId'
            if (field.variable_key === 'studentId' && value.trim()) { // Check if it's the studentId field and not empty
                // Check format (e.g., starts with digits, 8 digits long)
                if (!/^\d{8}$/.test(value.trim())) {
                    errors[field.name] = "Mã số sinh viên phải có đúng 8 chữ số.";
                    isValid = false;
                } else {
                    // Check against valid student IDs (simulated API call)
                    setIsSubmitting(true); // Temporarily show loading for this check
                    const isIdValid = await checkStudentIdValidity(value.trim());
                    setIsSubmitting(false);

                    if (!isIdValid) {
                        errors[field.name] = "Mã số sinh viên không tồn tại trong hệ thống.";
                        isValid = false;
                    }
                }
            }

            // Add more specific validations (e.g., email format, number ranges)
            if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
                errors[field.name] = 'Email không hợp lệ.';
                isValid = false;
            }
            if (field.type === 'number' && value) {
                if (field.min !== undefined && parseFloat(value) < field.min) {
                    errors[field.name] = `${field.label} phải lớn hơn hoặc bằng ${field.min}.`;
                    isValid = false;
                }
                if (field.max !== undefined && parseFloat(value) > field.max) {
                    errors[field.name] = `${field.label} phải nhỏ hơn hoặc bằng ${field.max}.`;
                    isValid = false;
                }
            }
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionError(null);
        setIsSubmitting(true);

        const isValid = await validateForm(); // Await validation, especially for async checks

        if (isValid) {
            try {
                // In a real app, you might send this formData to a backend API here first
                console.log("Form data valid:", formData);
                onPrintSubmit(formData); // Call parent function to handle print/preview
            } catch (err) {
                console.error("Error submitting form:", err);
                setSubmissionError("Đã có lỗi xảy ra khi xử lý đơn của bạn. Vui lòng thử lại.");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setIsSubmitting(false);
            setSubmissionError("Vui lòng kiểm tra lại các thông tin đã nhập.");
        }
    };

    const selectedTemplate = formConfig; // Already the combined config

    if (!selectedTemplate) {
        return <p className="text-center text-gray-600">Không có cấu hình mẫu đơn được chọn.</p>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-lg shadow-md"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b pb-3">
                {selectedTemplate.formName}
            </h2>
            <p className="text-gray-600 mb-6 text-center">{selectedTemplate.description}</p>

            {selectedTemplate.notes && selectedTemplate.notes.length > 0 && (
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md">
                    <p className="font-semibold mb-2">Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {selectedTemplate.notes.map((note, index) => (
                            <li key={index} className="text-sm">
                                <span className="font-medium">{note.title}:</span> {note.content}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {selectedTemplate.fields.map((field) => (
                    <div key={field.name} className="flex flex-col">
                        <label htmlFor={field.name} className="block text-gray-700 text-sm font-bold mb-2">
                            {field.label}{field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                            <textarea
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                required={field.required}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 h-24 resize-y"
                            />
                        ) : field.type === 'select' ? (
                            <select
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                required={field.required}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            >
                                {field.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type}
                                id={field.name}
                                name={field.name}
                                value={formData[field.name] || ''}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                required={field.required}
                                min={field.min}
                                max={field.max}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            />
                        )}
                        {formErrors[field.name] && (
                            <p className="text-red-500 text-xs italic mt-1">{formErrors[field.name]}</p>
                        )}
                    </div>
                ))}

                {submissionError && (
                    <p className="text-red-600 text-center text-sm p-2 bg-red-100 rounded-md">
                        {submissionError}
                    </p>
                )}

                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-200"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        "Tạo và Xem trước Đơn"
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default GenericForm;