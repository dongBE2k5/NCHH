import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios để sử dụng thay vì fetch API

function FormSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const [error, setError] = useState(null); // Thêm state error
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchAttempted(true);
    setIsLoading(true); // Bắt đầu loading
    setError(null); // Xóa lỗi cũ
    setResults([]); // Xóa kết quả cũ

    if (!searchTerm.trim()) {
      setError("Vui lòng nhập Mã số sinh viên.");
      setIsLoading(false);
      return;
    }

    try {
      // Sử dụng axios.get thay vì fetch
      const response = await axios.get(`http://localhost:8000/api/form-value/${searchTerm.trim()}`);
      const data = response.data; // axios tự động parse JSON
      console.log(data);
      
      // Bỏ logic gom nhóm. Trực tiếp gán dữ liệu từ API vào results.
      // Đảm bảo dữ liệu từ API có cấu trúc phù hợp (ví dụ: form_type.folder.name, values[0].student_code, created_at)
      // và thêm các trường cần thiết cho hiển thị nếu chúng không có sẵn trực tiếp.
      const formattedResults = data.map(form => ({
        id: form.id,
        studentCode: form.values && form.values.length > 0 ? form.values[0].student_code : 'N/A',
        folder: form.form_type?.folder?.name || 'Không có thư mục',
        // Chuyển đổi ngày sang định dạng hiển thị DD/MM/YYYY nếu cần
        date: form.created_at ? new Date(form.created_at).toLocaleDateString('vi-VN'): 'N/A',
        formRequestId: form.form_type?.folder?.id || null,// Lưu ID của form request để truyền vào handleViewDetail
      }));

      setResults(formattedResults);

      if (formattedResults.length === 0) {
        setError("Không tìm thấy biểu mẫu nào với Mã số sinh viên này.");
      }

    } catch (err) {
      console.error("Lỗi khi tìm kiếm:", err);
      if (err.response) {
        setError(err.response.data.message || "Đã có lỗi từ máy chủ khi tìm kiếm.");
      } else if (err.request) {
        setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError("Đã có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
      }
      setResults([]);
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };
  const convertDateFormat = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };
  // handleViewDetail giờ sẽ nhận studentCode và formRequestId (là id của từng đơn)
  const handleViewDetail = (studentCode, formRequestId, date) => {
    const formattedDate = convertDateFormat(date); // chuyển từ DD/MM/YYYY sang YYYY-MM-DD
    navigate(`/print-form-detail/${studentCode}/${formRequestId}/${formattedDate}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8 text-center">In Đơn MSSV</h1>

        <form onSubmit={handleSearch} className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Nhập Mã số sinh viên (MSSV)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg w-full sm:flex-grow focus:ring-blue-500 focus:border-blue-500 text-lg"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out shadow-md font-medium text-lg"
            disabled={isLoading} // Vô hiệu hóa nút khi đang loading
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Tìm kiếm"
            )}
          </button>
        </form>

        {error && ( // Hiển thị lỗi chung
          <div className="text-center text-red-600 text-lg mb-6 p-2 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {searchAttempted && !isLoading && results.length === 0 && !error && ( // Chỉ hiển thị khi đã tìm kiếm, không loading, không có kết quả và không có lỗi
          <div className="text-center text-gray-600 text-lg mb-6">
            Không tìm thấy biểu mẫu nào với Mã số sinh viên này.
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Kết quả tìm kiếm</h2>
            <div className="overflow-x-auto rounded-lg shadow-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-sky-200">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">ID đơn</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">MSSV</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Thư mục</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Ngày nộp</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((item) => ( // Không cần index làm key nếu item.id là duy nhất
                    <tr key={item.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                      <td className="px-6 py-4 text-center">{item.id}</td>
                      <td className="px-6 py-4 text-center">{item.studentCode}</td>
                      <td className="px-6 py-4 text-center">{item.folder}</td>
                      <td className="px-6 py-4 text-center">{item.date}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetail(item.studentCode, item.formRequestId, item.date)} // Truyền item.id làm formRequestId
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition duration-200 ease-in-out"
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FormSearch;