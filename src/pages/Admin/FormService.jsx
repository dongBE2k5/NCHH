// Đường dẫn cơ sở (base URL) của API backend của bạn
// Thay thế bằng địa chỉ backend thực tế của bạn
const API_BASE_URL = 'http://localhost:8080/api/forms'; // Ví dụ: Cổng backend của bạn là 8080 và endpoint là /api/forms

// Hàm lấy tất cả các mẫu đơn
export const fetchAllForms = async () => {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            // Xử lý lỗi nếu phản hồi không thành công (ví dụ: 404, 500)
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch forms');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching forms:', error);
        throw error; // Ném lỗi để component có thể bắt và hiển thị
    }
};

// Hàm lưu một mẫu đơn mới
export const saveForm = async (formData) => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Thêm các headers khác nếu cần (ví dụ: Authorization token)
            },
            body: JSON.stringify(formData), // formData ở đây là { name: 'Tên mẫu đơn' }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save form');
        }
        const data = await response.json();
        return data; // Trả về dữ liệu của mẫu đơn đã được lưu (thường bao gồm ID)
    } catch (error) {
        console.error('Error saving form:', error);
        throw error;
    }
};

// Hàm cập nhật một mẫu đơn hiện có
export const updateForm = async (id, updatedData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT', // Hoặc PATCH tùy theo API của bạn
            headers: {
                'Content-Type': 'application/json',
                // Thêm các headers khác nếu cần
            },
            body: JSON.stringify(updatedData), // updatedData ở đây là { name: 'Tên mẫu đơn mới' }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update form');
        }
        const data = await response.json();
        return data; // Trả về dữ liệu của mẫu đơn đã được cập nhật
    } catch (error) {
        console.error('Error updating form:', error);
        throw error;
    }
};

// Hàm xóa một mẫu đơn
export const deleteForm = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                // Thêm các headers khác nếu cần
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete form');
        }
        // Phản hồi của DELETE thường không có body, hoặc chỉ là một thông báo thành công
        // Nếu API trả về JSON, bạn có thể uncomment dòng dưới:
        // const data = await response.json();
        // return data;
        return { success: true, message: 'Form deleted successfully' };
    } catch (error) {
        console.error('Error deleting form:', error);
        throw error;
    }
};

// Hàm lấy layout của một form theo code (cho FormLayoutDesigner)
export const fetchFormLayout = async (formCode) => {
    try {
        // Giả định API endpoint để lấy layout là /api/forms/layout/:formCode
        const response = await fetch(`${API_BASE_URL}/layout/${formCode}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch layout for ${formCode}`);
        }
        const data = await response.json();
        return data; // Trả về mảng các trường của form
    } catch (error) {
        console.error(`Error fetching layout for ${formCode}:`, error);
        throw error;
    }
};

// Hàm lưu layout của một form (cho FormLayoutDesigner)
export const saveFormLayout = async (formCode, layoutFields) => {
    try {
        // Giả định API endpoint để lưu layout là /api/forms/layout/:formCode
        const response = await fetch(`${API_BASE_URL}/layout/${formCode}`, {
            method: 'POST', // Hoặc PUT nếu luôn ghi đè
            headers: {
                'Content-Type': 'application/json',
                // Thêm các headers khác nếu cần
            },
            body: JSON.stringify(layoutFields), // layoutFields là mảng các đối tượng trường
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to save layout for ${formCode}`);
        }
        const data = await response.json();
        return data; // Trả về phản hồi từ backend
    } catch (error) {
        console.error(`Error saving layout for ${formCode}:`, error);
        throw error;
    }
};