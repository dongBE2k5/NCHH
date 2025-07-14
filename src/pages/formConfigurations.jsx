// src/data/formConfigurations.js

const formConfigurations = {
    // Cấu hình cho Đơn xin nghỉ học (formId: 1, templateType: "NghiHoc")
    NghiHoc: {
        formName: "Đơn xin nghỉ học",
        description: "Đơn này dùng để xin phép nghỉ học tạm thời hoặc vĩnh viễn. Vui lòng điền đầy đủ thông tin chi tiết.",
        fields: [
            { name: 'fullName', label: 'Họ và tên', type: 'text', required: true, placeholder: 'Nguyễn Văn A' },
            { name: 'studentId', label: 'Mã số sinh viên', type: 'text', required: true, placeholder: 'SVxxxxxx' },
            { name: 'className', label: 'Lớp', type: 'text', required: true, placeholder: 'CNTTx-Kxx' },
            { name: 'reason', label: 'Lý do nghỉ học', type: 'textarea', required: true, placeholder: 'Nêu rõ lý do và thời gian nghỉ...' },
            { name: 'startDate', label: 'Ngày bắt đầu nghỉ', type: 'date', required: true },
            { name: 'endDate', label: 'Ngày kết thúc nghỉ', type: 'date', required: true },
            { name: 'contactPhone', label: 'Số điện thoại liên hệ', type: 'tel', required: true, placeholder: '0xxxxxxxxx' },
            { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'your_email@example.com' },
        ]
    },
    // Cấu hình cho Đơn xin cấp lại bảng điểm (formId: 2, templateType: "BangDiem")
    BangDiem: {
        formName: "Đơn xin cấp lại bảng điểm",
        description: "Yêu cầu cấp lại bảng điểm học tập. Vui lòng ghi rõ số lượng và lý do.",
        fields: [
            { name: 'fullName', label: 'Họ và tên', type: 'text', required: true, placeholder: 'Nguyễn Văn A' },
            { name: 'studentId', label: 'Mã số sinh viên', type: 'text', required: true, placeholder: 'SVxxxxxx' },
            { name: 'className', label: 'Lớp', type: 'text', required: true, placeholder: 'CNTTx-Kxx' },
            { name: 'numberOfCopies', label: 'Số lượng bản sao', type: 'number', required: true, min: 1 },
            { name: 'reason', label: 'Lý do cấp lại', type: 'textarea', required: true, placeholder: 'Mất, hỏng, cần bổ sung hồ sơ...' },
            { name: 'deliveryMethod', label: 'Phương thức nhận', type: 'select', required: true, options: ['Nhận trực tiếp', 'Gửi bưu điện'], placeholder: 'Chọn phương thức' },
        ]
    },
    // Cấu hình cho Đơn xin xác nhận sinh viên (formId: 3, templateType: "XacNhanSV")
    XacNhanSV: {
        formName: "Đơn xin xác nhận sinh viên",
        description: "Xin xác nhận là sinh viên của trường cho các mục đích khác nhau (vay vốn, miễn giảm, v.v.).",
        fields: [
            { name: 'fullName', label: 'Họ và tên', type: 'text', required: true },
            { name: 'studentId', label: 'Mã số sinh viên', type: 'text', required: true },
            { name: 'className', label: 'Lớp', type: 'text', required: true },
            { name: 'purpose', label: 'Mục đích xác nhận', type: 'textarea', required: true, placeholder: 'Vay vốn ngân hàng, xác nhận là sinh viên, v.v.' },
            { name: 'receivingUnit', label: 'Đơn vị nhận xác nhận', type: 'text', required: false, placeholder: 'VD: Ngân hàng VPBank, Công ty ABC' },
        ]
    },
    // Cấu hình cho Đơn phúc khảo (ví dụ mới)
    PhucKhao: {
        formName: "Đơn xin phúc khảo điểm",
        description: "Yêu cầu xem xét lại điểm của một môn học. Cần ghi rõ thông tin môn học và lý do phúc khảo.",
        fields: [
            { name: 'fullName', label: 'Họ và tên', type: 'text', required: true },
            { name: 'studentId', label: 'Mã số sinh viên', type: 'text', required: true },
            { name: 'className', label: 'Lớp', type: 'text', required: true },
            { name: 'courseName', label: 'Tên môn học', type: 'text', required: true, placeholder: 'Nhập tên môn học' },
            { name: 'courseCode', label: 'Mã môn học', type: 'text', required: true, placeholder: 'VD: IT001' },
            { name: 'semester', label: 'Học kỳ', type: 'text', required: true, placeholder: 'VD: Học kỳ 1, Năm học 2024-2025' },
            { name: 'reason', label: 'Lý do phúc khảo', type: 'textarea', required: true, placeholder: 'Nêu rõ lý do bạn cho rằng điểm số cần được xem xét lại.' },
        ]
    },
    // Thêm các cấu hình khác tại đây...
};

export default formConfigurations;