import React, { useState, useEffect } from "react";


    function FormListStudent() {
      const [isOpen, setIsOpen] = useState(false);
      const [isScrolled, setIsScrolled] = useState(false);
      const [showModal, setShowModal] = useState(false);

      useEffect(() => {
        const handleScroll = () => {
          setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);

      // Sample application forms data
      const applicationForms = [
        {
          id: 1,
          title: "Đơn Xin Cấp Bảng Điểm",
          description: "Yêu cầu cấp bảng điểm chính thức từ nhà trường.",
        },
        {
          id: 2,
          title: "Đơn Xin Nghỉ Học Tạm Thời",
          description: "Nộp đơn để xin nghỉ học tạm thời trong một học kỳ.",
        },
        {
          id: 3,
          title: "Đơn Đăng Ký Môn Học",
          description: "Đăng ký các môn học bổ sung hoặc thay đổi lịch học.",
        },
      ];

      return (
        <div className="font-sans">
          {/* Header */}
          <header className={`fixed w-full z-20 transition-all duration-300 ${isScrolled ? 'bg-blue-800 shadow-lg' : 'bg-transparent'}`}>
            <div className="container mx-auto flex justify-between items-center px-4 py-4">
              <div className="flex items-center space-x-4">
                <img src="https://via.placeholder.com/40" alt="Logo" className="h-10" />
                <h1 className="text-xl font-bold text-white">Hệ thống Nộp Đơn Học Vụ</h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#home" className="text-white hover:text-blue-200">Trang chủ</a>
                <a href="#features" className="text-white hover:text-blue-200">Tính năng</a>
                <a href="#support" className="text-white hover:text-blue-200">Hỗ trợ</a>
                <a href="#login" className="text-white hover:text-blue-200">Đăng nhập</a>
                <a href="#signup" className="bg-yellow-400 ipsa text-blue-800 px-4 py-2 rounded-md hover:bg-yellow-500">Đăng ký</a>
              </nav>
              <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
            {isOpen && (
              <div className="md:hidden bg-blue-800 text-white px-4 py-2">
                <a href="#home" className="block py-2 hover:text-blue-200">Trang chủ</a>
                <a href="#features" className="block py-2 hover:text-blue-200">Tính năng</a>
                <a href="#support" className="block py-2 hover:text-blue-200">Hỗ trợ</a>
                <a href="#login" className="block py-2 hover:text-blue-200">Đăng nhập</a>
                <a href="#signup" className="block py-2 bg-yellow-400 text-blue-800 px-4 rounded-md hover:bg-yellow-500">Đăng ký</a>
              </div>
            )}
          </header>

          {/* Hero Section */}
          <section className="relative bg-gradient-to-r from-blue-600 to-blue-400 text-white py-24">
            <div className="absolute inset-0 opacity-10">
              <img src="https://via.placeholder.com/1920x600" alt="Background" className="w-full h-full object-cover" />
            </div>
            <div className="container mx-auto px-4 text-center relative z-10">
              <h2 className="text-5xl font-bold mb-6 animate-fadeInUp">Quản Lý Học Vụ Dễ Dàng Hơn Bao Giờ Hết</h2>
              <p className="text-xl mb-8 animate-fadeInUp animate-delay-200">Nộp đơn, theo dõi trạng thái và truy cập tài liệu học vụ chỉ trong vài cú nhấp chuột.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-yellow-400 text-blue-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-500 hover:scale-105 active:scale-95 transition-transform"
              >
                Bắt đầu nộp đơn
              </button>
            </div>
          </section>

          {/* Modal for Application Forms */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 modal-backdrop">
              <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 modal-content">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">Chọn Loại Đơn</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-600 hover:text-gray-800"
                    aria-label="Đóng modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applicationForms.map((form, index) => (
                    <div
                      key={form.id}
                      className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow form-card"
                      style={{ '--index': index }}
                    >
                      <h4 className="text-lg font-semibold mb-2">{form.title}</h4>
                      <p className="text-gray-600 mb-4">{form.description}</p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        Chọn
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <section id="features" className="py-20 bg-gray-100">
            <div className="container mx-auto px-4">
              <h3 className="text-4xl font-bold text-center mb-12 animate-fadeInUp">Tại sao chọn chúng tôi?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:scale-105 transition-transform">
                  <svg className="w-12 h-12 mx-auto mb-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v6H9V7zm0 8h2v2H9v-2z" />
                  </svg>
                  <h4 className="text-xl font-semibold mb-2">Nộp đơn trực tuyến</h4>
                  <p>Gửi đơn học vụ nhanh chóng với giao diện thân thiện.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:scale-105 transition-transform">
                  <svg className="w-12 h-12 mx-auto mb-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v6H9V7zm0 8h2v2H9v-2z" />
                  </svg>
                  <h4 className="text-xl font-semibold mb-2">Theo dõi trạng thái</h4>
                  <p>Cập nhật tiến độ đơn của bạn theo thời gian thực.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:scale-105 transition-transform">
                  <svg className="w-12 h-12 mx-auto mb-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v6H9V7zm0 8h2v2H9v-2z" />
                  </svg>
                  <h4 className="text-xl font-semibold mb-2">Tài liệu học vụ</h4>
                  <p>Tải xuống biểu mẫu và tài liệu cần thiết mọi lúc.</p>
                </div>
              </div>
              {/* Stats */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="animate-fadeInUp">
                  <h4 className="text-3xl font-bold text-blue-600">10,000+</h4>
                  <p>Đơn học vụ đã xử lý</p>
                </div>
                <div className="animate-fadeInUp animate-delay-200">
                  <h4 className="text-3xl font-bold text-blue-600">50+</h4>
                  <p>Trường đại học đối tác</p>
                </div>
                <div className="animate-fadeInUp animate-delay-400">
                  <h4 className="text-3xl font-bold text-blue-600">24/7</h4>
                  <p>Hỗ trợ trực tuyến</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-blue-600 text-white">
            <div className="container mx-auto px-4 text-center">
              <h3 className="text-3xl font-bold mb-6 animate-fadeInUp">Sẵn sàng bắt đầu?</h3>
              <p className="text-lg mb-8 animate-fadeInUp animate-delay-200">Đăng ký ngay hôm nay để trải nghiệm hệ thống nộp đơn học vụ hiện đại nhất!</p>
              <a href="#signup" className="bg-yellow-400 text-blue-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-500 hover:scale-105 active:scale-95 transition-transform">Đăng ký miễn phí</a>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-blue-800 text-white py-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
                  <p>Email: support@hethonghocvu.edu.vn</p>
                  <p>Hotline: 0123 456 789</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
                  <ul className="space-y-2">
                    <li><a href="#home" className="hover:text-blue-200">Trang chủ</a></li>
                    <li><a href="#features" className="hover:text-blue-200">Tính năng</a></li>
                    <li><a href="#support" className="hover:text-blue-200">Hỗ trợ</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Theo dõi chúng tôi</h4>
                  <div className="flex space-x-4">
                    <a href="#" className="hover:text-blue-200">Facebook</a>
                    <a href="#" className="hover:text-blue-200">Twitter</a>
                    <a href="#" className="hover:text-blue-200">LinkedIn</a>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-4">Vị trí</h4>
                  <div className="h-32 bg-gray-200 rounded-md">
                    <iframe
                      src="https://via.placeholder.com/300x120?text=Map+Placeholder"
                      className="w-full h-full rounded-md"
                      title="Map"
                    ></iframe>
                  </div>
                </div>
              </div>
              <div className="text-center mt-8">
                <p>© 2025 Hệ thống Nộp Đơn Học Vụ. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      );
    }
    export default FormListStudent;
