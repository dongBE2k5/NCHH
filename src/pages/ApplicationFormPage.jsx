import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import FormDetailStudent from "../pages/Student/FormDetailStudent";
import FolderService from "../service/FolderService";
import NoteService from "../service/NoteService"; // Keep NoteService for fetching specific note
import FormTemplateService from "../service/FormTemplateService";
import { API_BASE_URL } from '../service/BaseUrl';
import Swal from 'sweetalert2';
import {
  FolderIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserCircleIcon,
  ClipboardDocumentIcon // Icon for notes in the list
} from "@heroicons/react/24/solid";

const STUDENT_ID_SESSION_KEY = "verifiedStudentId";


export default function ApplicationFormPage() {
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentEmailInput, setStudentEmailInput] = useState("");
  const [studentIdError, setStudentIdError] = useState("");
  const [studentEmailError, setStudentEmailError] = useState("");

  const [verifiedStudentId, setVerifiedStudentId] = useState(() =>
    sessionStorage.getItem(STUDENT_ID_SESSION_KEY)
  );
  const [tempNewStudentData, setTempNewStudentData] = useState(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegisteringEmail, setIsRegisteringEmail] = useState(false);

  const [treeData, setTreeData] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedItemType, setSelectedItemType] = useState(null); // 'form' or 'note'

  const [currentNoteContent, setCurrentNoteContent] = useState(""); // State to hold the note content for the *selected form*

  const [isLoadingForms, setIsLoadingForms] = useState(true);
  const [openFolders, setOpenFolders] = useState({});

  // Function to build the tree data, now including notes
  // IMPORTANT: For displaying notes *with forms*, this `buildTree`
  // should ideally be simplified to only list forms and folders.
  // Notes would be fetched *when a form is selected*.
  // However, if you want notes to be selectable independently, the previous `buildTree` is fine.
  // For this fix, let's assume notes are selected independently OR associated with forms.
  // Let's assume you want to show notes in the left panel as separate selectable items AND
  // if a FORM has an associated note, display that note's content above the form in the right panel.
  // This implies fetching notes *again* when a form is selected.

  const buildTree = (folders, forms, notes) => {
    const map = new Map();
    const tree = [];

    const folderItems = folders.map(item => ({
      id: `folder-${item.id}`, // Prefix folder IDs too for consistency
      name: item.name,
      type: 'folder',
      parentId: item.parent_id === item.id ? null : item.parent_id,
      children: []
    }));

    const formItems = forms.map(item => ({
      id: `form-${item.id}`,
      name: item.name,
      type: 'form',
      parentId: item.parent_id ? item.parent_id : null,
      children: []
    }));

    // Notes that are independent (not directly attached to a form parent_id, or you want them independently selectable)
    const independentNoteItems = notes.filter(note => !forms.some(form => form.id === note.parent_id)).map(item => ({
      id: `note-${item.id}`,
      name: item.name,
      content: item.content,
      type: 'note',
      parentId: item.parent_id ? item.parent_id : null,
      children: []
    }));

    // Combine all items
    const allItems = [...folderItems, ...formItems, ...independentNoteItems];
    allItems.forEach(item => map.set(item.id, item));

    // Establish parent-child relationships
    allItems.forEach(item => {
      if (item.parentId === null || !map.has(`folder-${item.parentId}`)) { // Check for prefixed folder ID
        tree.push(item);
      } else {
        map.get(`folder-${item.parentId}`).children.push(item); // Add to prefixed folder ID
      }
    });

    const sortTree = (nodes) => {
      nodes.sort((a, b) => {
        const typeOrder = { 'folder': 1, 'form': 2, 'note': 3 }; // Order: Folders, Forms, Notes
        if (typeOrder[a.type] !== typeOrder[b.type]) {
          return typeOrder[a.type] - typeOrder[b.type];
        }
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => sortTree(node.children));
    };

    sortTree(tree);
    return tree;
  };


  const fetchData = useCallback(async () => {
    setIsLoadingForms(true);
    try {
      const [folderList, allForms, allNotes] = await Promise.all([
        FolderService.fetchForms(),
        FormTemplateService.fetchForms(),
        NoteService.fetchNotes(), // Fetch all notes
      ]);
      const tree = buildTree(folderList, allForms, allNotes);
      setTreeData(tree);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu biểu mẫu và ghi chú:", err);
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
        message: `Chào mừng ${studentName} đăng ký thành công! Từ bây giờ bạn sẽ nhận thông báo từ chúng tôi qua email này.`,
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
    setStudentEmailError("");

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
        // If no 404 error, student already exists
        setVerifiedStudentId(studentIdInput);
        sessionStorage.setItem(STUDENT_ID_SESSION_KEY, studentIdInput);
        setTempNewStudentData(null);
        setStudentIdInput('');
      } catch (checkError) {
        if (checkError.response && checkError.response.status === 404) {
          setTempNewStudentData({ id: studentIdInput, name: name });
          setStudentIdInput('');
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
      await axios.post(`${API_BASE_URL}/student`, {
        name: tempNewStudentData.name,
        student_code: tempNewStudentData.id,
        email: studentEmailInput,
      });

      await sendWelcomeEmail(tempNewStudentData.id, tempNewStudentData.name, studentEmailInput);

      setVerifiedStudentId(tempNewStudentData.id);
      sessionStorage.setItem(STUDENT_ID_SESSION_KEY, tempNewStudentData.id);

      setTempNewStudentData(null);
      setStudentEmailInput('');
      setSelectedItemId(null);
      setSelectedItemName("");
      setSelectedItemType(null);
      setCurrentNoteContent(""); // Clear note content

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

  const handleSelectItem = async (id, name, type, content = null) => {
    setSelectedItemId(id);
    setSelectedItemName(name);
    setSelectedItemType(type);
    setCurrentNoteContent(""); // Clear previous note content

    if (type === 'note') {
      // For notes, display content directly using Swal.fire
      Swal.fire({
        title: name,
        html: `<div style="text-align: left; max-height: 400px; overflow-y: auto; padding: 10px; border: 1px solid #eee; border-radius: 5px; background: #f9f9f9;">
                 <pre style="margin: 0; white-space: pre-wrap; word-break: break-word;">${content || 'Không có nội dung.'}</pre>
               </div>`,
        icon: 'info',
        confirmButtonText: 'Đóng',
        customClass: {
          container: 'my-swal-container',
          popup: 'my-swal-popup',
          title: 'my-swal-title',
          htmlContainer: 'my-swal-html',
        }
      });
    } else if (type === 'form') {
      // If a form is selected, try to fetch its associated note
      const formOriginalId = id.replace('form-', '');
      console.log(formOriginalId);
      
      try {
        const res = await NoteService.showFolder(formOriginalId); // Assuming you have an API to get note by template ID
        console.log(res.data.content);
        
        if (res.data && res.data[0].content) {
          setCurrentNoteContent(res.data[0].content);
        } else {
          setCurrentNoteContent("Không có ghi chú nào cho biểu mẫu này.");
        }
      } catch (error) {
        console.error("Lỗi khi tải ghi chú cho biểu mẫu:", error);
        setCurrentNoteContent("Lỗi khi tải ghi chú.");
      }
    }
  };

  const handleResetVerification = () => {
    setVerifiedStudentId(null);
    sessionStorage.removeItem(STUDENT_ID_SESSION_KEY);
    setSelectedItemId(null);
    setSelectedItemName("");
    setSelectedItemType(null);
    setCurrentNoteContent(""); // Reset note content here as well
    setStudentIdInput("");
    setStudentEmailInput("");
    setStudentIdError("");
    setStudentEmailError("");
    setTempNewStudentData(null);
  };

  // Helper function to render tree items
  const renderTreeItems = (items) => {
    return items.map((item) => (
      <div key={item.id}>
        {item.type === 'folder' ? (
          <div>
            <button
              onClick={() => toggleFolder(item.id)}
              className="w-full text-left font-semibold text-gray-700 flex items-center gap-2 py-2 hover:bg-gray-50 rounded-lg transition-colors duration-200"
            >
              {openFolders[item.id] ? (
                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 text-gray-500" />
              )}
              <FolderIcon className="h-5 w-5 text-yellow-500" />{" "}
              {item.name}
            </button>
            <AnimatePresence>
              {openFolders[item.id] && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="ml-5 mt-2 space-y-1"
                >
                  {item.children.length > 0 ? (
                    renderTreeItems(item.children)
                  ) : (
                    <li className="text-gray-500 text-sm italic py-1 px-3">
                      Không có mục nào trong thư mục này.
                    </li>
                  )}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <li className="mb-1">
            <button
              onClick={() => handleSelectItem(item.id, item.name, item.type, item.content)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 ease-in-out ${selectedItemId === item.id
                  ? "bg-blue-600 text-white font-semibold shadow-md"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
            >
              {item.type === 'form' ? (
                <DocumentTextIcon className="h-4 w-4" />
              ) : (
                <ClipboardDocumentIcon className="h-4 w-4 text-green-500" />
              )}{" "}
              {item.name}
            </button>
          </li>
        )}
      </div>
    ));
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
            Chọn biểu mẫu hoặc ghi chú
          </h2>

          {!verifiedStudentId && !tempNewStudentData ? (
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
                  Đang tải biểu mẫu và ghi chú...
                </p>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {renderTreeItems(treeData)}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Khu vực hiển thị FormDetailStudent hoặc thông báo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="md:flex-grow w-full bg-white rounded-xl shadow p-6 flex flex-col"
        >
          <AnimatePresence mode="wait">
            {!verifiedStudentId && !tempNewStudentData ? (
              <motion.div
                key="verify-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <p className="text-center text-gray-600 text-lg mb-4">
                  Vui lòng **xác thực Mã số sinh viên** để bắt đầu.
                </p>
                <DocumentTextIcon className="h-24 w-24 text-gray-300" />
              </motion.div>
            ) : !verifiedStudentId && tempNewStudentData ? (
              <motion.div
                key="register-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center h-full text-center p-6 bg-blue-50 rounded-lg border border-blue-200"
              >
                <UserCircleIcon className="h-20 w-20 text-blue-400 mb-4" />
                <p className="text-xl font-semibold text-blue-800 mb-2">Hoàn tất Đăng ký</p>
                <p className="text-gray-700 text-base">
                  MSSV <strong>{tempNewStudentData.id}</strong> đã được xác thực thành công.
                  Vui lòng nhập Email của bạn vào form bên trái để tiếp tục.
                </p>
              </motion.div>
            ) : selectedItemType === 'form' ? (
              <motion.div
                key={selectedItemId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                <div className="mb-6 pb-4 border-b border-gray-200">
                  {/* Display the note content here */}
                  {currentNoteContent && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg mb-3 text-sm">
                      <p className="font-semibold flex items-center gap-2">
                        <ClipboardDocumentIcon className="h-4 w-4 text-yellow-600" />
                        Yêu cầu:
                      </p>
                      <p className="mt-2">{currentNoteContent}</p>
                    </div>
                  )}

                  <h2 className="text-xl md:text-2xl font-bold text-blue-700 flex items-center gap-3">
                    <DocumentTextIcon className="h-7 w-7 text-blue-600" />
                    {selectedItemName || "Biểu mẫu đã chọn"}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Điền thông tin vào biểu mẫu dưới đây và tạo bản in của bạn.
                  </p>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  <FormDetailStudent
                    selectedId={selectedItemId.replace('form-', '')}
                    studentId={verifiedStudentId}
                  />
                </div>
              </motion.div>
            ) : selectedItemType === 'note' ? (
              <motion.div
                key="note-selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center h-full text-center p-6 bg-green-50 rounded-lg border border-green-200"
              >
                <ClipboardDocumentIcon className="h-20 w-20 text-green-400 mb-4" />
                <p className="text-xl font-semibold text-green-800 mb-2">Ghi chú đã chọn</p>
                <p className="text-gray-700 text-base">
                  Nội dung của ghi chú "**{selectedItemName}**" đã được hiển thị trong một cửa sổ bật lên.
                  Bạn có thể đóng cửa sổ đó để tiếp tục.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="no-item-selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center h-full"
              >
                <p className="text-center text-gray-600 text-lg mb-4 ">
                  Vui lòng **chọn một biểu mẫu hoặc ghi chú** từ danh sách bên trái để bắt đầu.
                </p>
                <DocumentTextIcon className="h-24 w-24 text-gray-300" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}