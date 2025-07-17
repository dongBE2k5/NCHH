import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import FormDetailStudent from "../pages/Student/FormDetailStudent";
import FolderService from "../service/FolderService";
import FormTemplateService from "../service/FormTemplateService";
import Swal from 'sweetalert2';
import {
  FolderIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserCircleIcon, // Icon mới cho bước nhập email
} from "@heroicons/react/24/solid";

const STUDENT_ID_SESSION_KEY = "verifiedStudentId";
import { API_BASE_URL } from '../service/BaseUrl';

export default function ApplicationFormPage() {
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentEmailInput, setStudentEmailInput] = useState("");
  const [studentIdError, setStudentIdError] = useState("");
  const [studentEmailError, setStudentEmailError] = useState("");

  const [verifiedStudentId, setVerifiedStudentId] = useState(() =>
    sessionStorage.getItem(STUDENT_ID_SESSION_KEY)
  );
  // State tạm thời để lưu MSSV và tên của sinh viên mới trước khi nhập email
  const [tempNewStudentData, setTempNewStudentData] = useState(null); // { id: 'MSSV', name: 'Tên SV' }

  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegisteringEmail, setIsRegisteringEmail] = useState(false); // Trạng thái cho việc đăng ký email

  const [folders, setFolders] = useState([]);
  const [formsWithoutFolder, setFormsWithoutFolder] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [openFolders, setOpenFolders] = useState({});

  const fetchData = useCallback(async () => {
    setIsLoadingForms(true);
    try {
      const [folderList, allForms] = await Promise.all([
        FolderService.fetchForms(),
        FormTemplateService.fetchForms(),
      ]);

      const folderMap = {};
      folderList.forEach((folder) => {
        folderMap[folder.id] = { ...folder, forms: [] };
      });

      const formsIndependent = [];

      allForms.forEach((form) => {
        if (form.parent_id && folderMap[form.parent_id]) {
          folderMap[form.parent_id].forms.push(form);
        } else {
          formsIndependent.push(form);
        }
      });

      setFolders(Object.values(folderMap));
      setFormsWithoutFolder(formsIndependent);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu biểu mẫu:", err);
    } finally {
      setIsLoadingForms(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sendWelcomeEmail = async (studentCode, studentName, studentEmail) => {
    try {
      await axios.post(`${API_BASE_URL}/send-email-student`, {
        title: "Chào mừng bạn đến website của chúng tôi",
        message: `Chào mùng ${studentName} đăng ký thành công từ bây giờ bạn sẽ nhận thông báo từ chúng tôi qua email này`,
        student_codes: [studentCode],
      });
      Swal.fire({
        icon: 'success',
        title: 'Thông báo!',
        text: `Chào mừng ${studentName}! Một email chào mừng đã được gửi đến ${studentEmail}.`,
        confirmButtonText: 'Đã hiểu',
        customClass: {
          confirmButton: 'swal-button-custom-confirm',
        },
        buttonsStyling: false,
      });
    } catch (emailError) {
      console.error("Lỗi khi gửi email chào mừng:", emailError);
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo!',
        text: `Không thể gửi email chào mừng đến ${studentEmail}. Vui lòng kiểm tra lại cấu hình email hoặc thông tin sinh viên.`,
        confirmButtonText: 'Đã hiểu',
        customClass: {
          confirmButton: 'swal-button-custom-error',
        },
        buttonsStyling: false,
      });
    }
  };

  const handleVerify = async () => {
    setStudentIdError("");
    setStudentEmailError(""); // Luôn reset lỗi email khi bắt đầu xác thực MSSV

    if (!studentIdInput.trim()) {
      setStudentIdError("Vui lòng nhập Mã số sinh viên.");
      return;
    }
    if (!/^[A-Za-z0-9]{11}$/.test(studentIdInput)) {
      setStudentIdError("Mã số sinh viên phải gồm 11 ký tự chữ và số.");
      return;
    }

    setIsVerifying(true);
    try {
      const scrapeResponse = await axios.get(
        `${API_BASE_URL}/scrape-element?url=https://online.tdc.edu.vn/Portlets/Uis_Myspace/Professor/Marks.aspx?StudentID=${studentIdInput}&selector=span#lbInfo`
      );
      const scrapeResult = scrapeResponse.data;

      const matchedLine = scrapeResult.data.find((line) =>
        line.includes("[Mã số:")
      );

      if (!matchedLine) {
        setStudentIdError("Không tìm thấy thông tin sinh viên phù hợp.");
        return;
      }

      const idMatch = matchedLine.match(/\[Mã số:\s*(\w+)\]/);
      if (!idMatch || idMatch[1] !== studentIdInput) {
        setStudentIdError("Mã số sinh viên không khớp với dữ liệu đã lấy.");
        return;
      }

      const name = matchedLine.split("[Mã số")[0].trim();

      try {
        await axios.get(`${API_BASE_URL}/student/search/${studentIdInput}`);
        // Nếu không có lỗi 404, tức là sinh viên đã tồn tại
        setVerifiedStudentId(studentIdInput);
        sessionStorage.setItem(STUDENT_ID_SESSION_KEY, studentIdInput);
        setTempNewStudentData(null); // Đảm bảo clear nếu có
        setStudentIdInput(''); // Clear input after successful verification
      } catch (checkError) {
        if (checkError.response && checkError.response.status === 404) {
          // Sinh viên chưa tồn tại, chuyển sang bước nhập email
          setTempNewStudentData({ id: studentIdInput, name: name });
          setStudentIdInput(''); // Clear MSSV input for next step
          Swal.fire({
            icon: 'info',
            title: 'Chào mừng sinh viên mới!',
            text: `MSSV ${studentIdInput} của bạn đã được xác thực. Vui lòng nhập email để hoàn tất đăng ký.`,
            confirmButtonText: 'Tiếp tục',
            customClass: {
              confirmButton: 'swal-button-custom-confirm',
            },
            buttonsStyling: false,
          });
        } else {
          // Xử lý các lỗi khác ngoài 404
          throw checkError;
        }
      }

    } catch (err) {
      console.error("Lỗi trong quá trình xác thực:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Lỗi không xác định.";
      setStudentIdError(
        `Không thể xác thực MSSV. Chi tiết lỗi: ${errorMessage}`
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRegisterNewStudent = async () => {
    setStudentEmailError("");

    if (!studentEmailInput.trim()) {
        setStudentEmailError("Vui lòng nhập địa chỉ email.");
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmailInput)) {
        setStudentEmailError("Địa chỉ email không hợp lệ.");
        return;
    }

    setIsRegisteringEmail(true);
    try {
        // Tạo sinh viên mới với email
        await axios.post(`${API_BASE_URL}/student`, {
            name: tempNewStudentData.name,
            student_code: tempNewStudentData.id,
            email: studentEmailInput,
        });

        // Gửi email chào mừng
        await sendWelcomeEmail(tempNewStudentData.id, tempNewStudentData.name, studentEmailInput);

        // Đặt trạng thái đã xác thực và chuyển giao diện
        setVerifiedStudentId(tempNewStudentData.id);
        sessionStorage.setItem(STUDENT_ID_SESSION_KEY, tempNewStudentData.id);

        // Reset các trạng thái tạm thời
        setTempNewStudentData(null);
        setStudentEmailInput('');
        setSelectedTemplateId(null);
        setSelectedTemplateName("");

    } catch (err) {
        console.error("Lỗi khi đăng ký email cho sinh viên mới:", err);
        const errorMessage =
          err.response?.data?.message || err.message || "Lỗi không xác định khi lưu email.";
        Swal.fire({
            icon: 'error',
            title: 'Lỗi đăng ký!',
            text: errorMessage,
            confirmButtonText: 'Thử lại',
            customClass: {
              confirmButton: 'swal-button-custom-error',
            },
            buttonsStyling: false,
        });
    } finally {
        setIsRegisteringEmail(false);
    }
  };

  const toggleFolder = (folderId) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleSelectTemplate = (templateId, templateName) => {
    setSelectedTemplateId(templateId);
    setSelectedTemplateName(templateName);
  };

  const handleResetVerification = () => {
    setVerifiedStudentId(null);
    sessionStorage.removeItem(STUDENT_ID_SESSION_KEY);
    setSelectedTemplateId(null);
    setSelectedTemplateName("");
    setStudentIdInput("");
    setStudentEmailInput("");
    setStudentIdError("");
    setStudentEmailError("");
    setTempNewStudentData(null); // Rất quan trọng: reset dữ liệu sinh viên mới tạm thời
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center text-blue-700">
            Tạo và In Biểu Mẫu
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 flex-grow">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:w-1/3 w-full bg-white rounded-xl shadow p-6 overflow-hidden flex flex-col"
        >
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            Chọn biểu mẫu
          </h2>

          {/* Logic hiển thị theo 3 trạng thái: Chưa xác thực, Đang nhập email cho SV mới, Đã xác thực */}
          {!verifiedStudentId && !tempNewStudentData ? (
            // TRẠNG THÁI 1: CHƯA XÁC THỰC MSSV
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nhập Mã số sinh viên (MSSV)"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value.trim())}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                disabled={isVerifying}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerify();
                }}
              />
              {studentIdError && (
                <p className="text-red-600 text-sm mt-1">{studentIdError}</p>
              )}
              <button
                onClick={handleVerify}
                className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isVerifying}
              >
                {isVerifying ? "Đang xác thực..." : "Xác thực MSSV"}
              </button>
            </div>
          ) : !verifiedStudentId && tempNewStudentData ? (
            // TRẠNG THÁI 2: ĐANG NHẬP EMAIL CHO SINH VIÊN MỚI
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50"
            >
                <div className="flex items-center space-x-3 text-blue-800">
                    <UserCircleIcon className="h-6 w-6" />
                    <h3 className="font-semibold text-lg">Chào mừng, {tempNewStudentData.name}!</h3>
                </div>
                <p className="text-sm text-blue-700">
                    Mã số sinh viên **{tempNewStudentData.id}** của bạn đã được xác thực.
                    Vui lòng nhập địa chỉ email để hoàn tất đăng ký tài khoản.
                </p>
                <input
                    type="email"
                    placeholder="Nhập địa chỉ Email của bạn"
                    value={studentEmailInput}
                    onChange={(e) => setStudentEmailInput(e.target.value.trim())}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    disabled={isRegisteringEmail}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleRegisterNewStudent();
                    }}
                />
                {studentEmailError && (
                    <p className="text-red-600 text-sm mt-1">{studentEmailError}</p>
                )}
                <button
                    onClick={handleRegisterNewStudent}
                    className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isRegisteringEmail}
                >
                    {isRegisteringEmail ? "Đang hoàn tất..." : "Hoàn tất đăng ký"}
                </button>
                <button
                    onClick={handleResetVerification}
                    className="w-full text-blue-600 hover:text-blue-800 text-sm mt-2"
                >
                    Hủy bỏ và quay lại xác thực MSSV
                </button>
            </motion.div>
          ) : (
            // TRẠNG THÁI 3: ĐÃ XÁC THỰC MSSV (sinh viên cũ hoặc đã hoàn tất đăng ký)
            <>
              <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-lg mb-4 text-sm flex items-center justify-between">
                <div>
                  MSSV đã xác thực:{" "}
                  <strong className="text-green-900">
                    {verifiedStudentId}
                  </strong>
                </div>
                <button
                  onClick={handleResetVerification}
                  className="text-blue-600 hover:text-blue-800 underline font-medium ml-4 transition-colors duration-200"
                >
                  Thay đổi
                </button>
              </div>

              {isLoadingForms ? (
                <p className="text-center text-gray-500 py-10">
                  Đang tải biểu mẫu...
                </p>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {formsWithoutFolder.length > 0 && (
                    <div className="pb-2">
                      <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <DocumentTextIcon className="h-5 w-5 text-blue-500" />{" "}
                        Biểu mẫu độc lập
                      </h3>
                      <ul className="ml-5 space-y-1">
                        {formsWithoutFolder.map((form) => (
                          <li key={form.id}>
                            <button
                              onClick={() =>
                                handleSelectTemplate(form.id, form.name)
                              }
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ease-in-out ${
                                selectedTemplateId === form.id
                                  ? "bg-blue-600 text-white font-semibold shadow-md"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              }`}
                            >
                              <DocumentTextIcon className="h-4 w-4" />{" "}
                              {form.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="border-b border-gray-200 pb-2 last:border-b-0"
                    >
                      <button
                        onClick={() => toggleFolder(folder.id)}
                        className="w-full text-left font-semibold text-gray-700 flex items-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      >
                        {openFolders[folder.id] ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                        )}
                        <FolderIcon className="h-5 w-5 text-yellow-500" />{" "}
                        {folder.name}
                      </button>
                      <AnimatePresence>
                        {openFolders[folder.id] && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="ml-5 mt-2 space-y-1"
                          >
                            {folder.forms.length > 0 ? (
                              folder.forms.map((form) => (
                                <li key={form.id}>
                                  <button
                                    onClick={() =>
                                      handleSelectTemplate(form.id, form.name)
                                    }
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ease-in-out ${
                                      selectedTemplateId === form.id
                                        ? "bg-blue-600 text-white font-semibold shadow-md"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    }`}
                                  >
                                    <DocumentTextIcon className="h-4 w-4" />{" "}
                                    {form.name}
                                  </button>
                                </li>
                              ))
                            ) : (
                              <li className="text-gray-500 text-sm italic py-1 px-3">
                                Không có biểu mẫu nào trong thư mục này.
                              </li>
                            )}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Khu vực hiển thị FormDetailStudent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="md:flex-grow w-full bg-white rounded-xl shadow p-6 flex flex-col"
        >
          {/* Thay đổi thông báo dựa trên các trạng thái */}
          {!verifiedStudentId && !tempNewStudentData ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-center text-gray-600 text-lg mb-4">
                Vui lòng **xác thực Mã số sinh viên** để bắt đầu.
              </p>
              <DocumentTextIcon className="h-24 w-24 text-gray-300" />
            </div>
          ) : !verifiedStudentId && tempNewStudentData ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <UserCircleIcon className="h-20 w-20 text-blue-400 mb-4" />
                <p className="text-xl font-semibold text-blue-800 mb-2">Hoàn tất Đăng ký</p>
                <p className="text-gray-700 text-base">
                    MSSV <strong>{tempNewStudentData.id}</strong> đã được xác thực thành công.
                    Vui lòng nhập Email của bạn vào form bên trái để tiếp tục.
                </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {selectedTemplateId ? (
                <motion.div
                  key={selectedTemplateId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-xl md:text-2xl font-bold text-blue-700 flex items-center gap-3">
                      <DocumentTextIcon className="h-7 w-7 text-blue-600" />
                      {selectedTemplateName || "Biểu mẫu đã chọn"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Điền thông tin vào biểu mẫu dưới đây và tạo bản in của bạn.
                    </p>
                  </div>
                  <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                      <FormDetailStudent
                          selectedId={selectedTemplateId}
                          studentId={verifiedStudentId}
                      />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="no-template-selected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center h-full"
                >
                  <p className="text-center text-gray-600 text-lg mb-4">
                    Vui lòng **chọn một biểu mẫu** từ danh sách bên trái để bắt
                    đầu.
                  </p>
                  <DocumentTextIcon className="h-24 w-24 text-gray-300" />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </main>
    </div>
  );
}