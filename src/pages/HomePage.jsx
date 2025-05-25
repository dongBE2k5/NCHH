import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formList, setFormList] = useState([])
  const navigate = useNavigate();
  useEffect(() => {

    async function getAllForm() {
      const url = 'http://nckh.local/api/forms';
      const response = await fetch(url);
      const result = await response.json()
      setFormList(result)
      console.log(result);
    }
    getAllForm()

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);


  }, []);


  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-400 text-white py-24">
        <div className="absolute inset-0 opacity-10">
          <img src="https://via.placeholder.com/1920x600" alt="Background" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold mb-6"
          >
            Quản Lý Học Vụ Dễ Dàng Hơn Bao Giờ Hết
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl mb-8"
          >
            Nộp đơn, theo dõi trạng thái và truy cập tài liệu học vụ chỉ trong vài cú nhấp chuột.
          </motion.p>
          <motion.button
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-yellow-400 text-blue-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-500 hover:scale-105 active:scale-95 transition-transform"
          >
            Bắt đầu nộp đơn
          </motion.button>
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
              {formList.map((form, index) => (
                <div
                  key={form.id}
                  className="bg-gray-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow form-card"
                  style={{ '--index': index }}
                >
                  <h4 className="text-lg font-semibold mb-2">{form.name}</h4>
                  <p className="text-gray-600 mb-4">Description form</p>

                  <Link to={`/forms/${form.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Chọn
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-12"
          >
            Tại sao chọn chúng tôi?
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow-lg text-center"
            >
              <svg className="w-12 h-12 mx-auto mb-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v6H9V7zm0 8h2v2H9v-2z" />
              </svg>
              <h4 className="text-xl font-semibold mb-2">Nộp đơn trực tuyến</h4>
              <p>Gửi đơn học vụ nhanh chóng với giao diện thân thiện.</p>
            </motion.div>
            <motion.div
              onClick={() => navigate("/status")}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg cursor-pointer shadow-lg text-center"
            >
              <svg className="w-12 h-12 mx-auto mb-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v6H9V7zm0 8h2v2H9v-2z" />
              </svg>
              <h4 className="text-xl font-semibold mb-2">Theo dõi trạng thái</h4>
              <p>Cập nhật tiến độ đơn của bạn theo thời gian thực.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow-lg text-center"
            >
              <svg className="w-12 h-12 mx-auto mb-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 00-8 8 8 8 0 008 8 8 8 0 008-8 8 8 0 00-8-8zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-9h2v6H9V7zm0 8h2v2H9v-2z" />
              </svg>
              <h4 className="text-xl font-semibold mb-2">Tài liệu học vụ</h4>
              <p>Tải xuống biểu mẫu và tài liệu cần thiết mọi lúc.</p>
            </motion.div>
          </div>
          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h4 className="text-3xl font-bold text-blue-600">10,000+</h4>
              <p>Đơn học vụ đã xử lý</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4 className="text-3xl font-bold text-blue-600">50+</h4>
              <p>Trường đại học đối tác</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h4 className="text-3xl font-bold text-blue-600">24/7</h4>
              <p>Hỗ trợ trực tuyến</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-bold mb-6"
          >
            Sẵn sàng bắt đầu?
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg mb-8"
          >
            Đăng ký ngay hôm nay để trải nghiệm hệ thống nộp đơn học vụ hiện đại nhất!
          </motion.p>
          <motion.a
            href="#signup"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-yellow-400 text-blue-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-500"
          >
            Đăng ký miễn phí
          </motion.a>
        </div>
      </section>
     
    </div>
  );
}
export default HomePage;