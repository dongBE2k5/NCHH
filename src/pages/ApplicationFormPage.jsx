import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FormDetailStudent from "../pages/Student/FormDetailStudent";
import FolderService from "../service/FolderService";
import FormTemplateService from "../service/FormTemplateService";
import { FolderIcon, DocumentTextIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid'; // Import solid icons

const STUDENT_ID_SESSION_KEY = "verifiedStudentId";

export default function ApplicationFormPage() {
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentIdError, setStudentIdError] = useState("");
  const [verifiedStudentId, setVerifiedStudentId] = useState(() => sessionStorage.getItem(STUDENT_ID_SESSION_KEY) || null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [folders, setFolders] = useState([]);
  const [formsWithoutFolder, setFormsWithoutFolder] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFolders, setOpenFolders] = useState({}); // State để quản lý folder nào đang mở

  useEffect(() => {
    async function fetchData() {
      try {
        const [folderList, allForms] = await Promise.all([
          FolderService.fetchForms(),
          FormTemplateService.fetchForms(),
        ]);

        const folderMap = {};
        folderList.forEach(folder => {
          folderMap[folder.id] = { ...folder, forms: [] };
        });

        const formsWithoutFolder = [];

        allForms.forEach(form => {
          if (form.parent_id && folderMap[form.parent_id]) {
            folderMap[form.parent_id].forms.push(form);
          } else {
            formsWithoutFolder.push(form);
          }
        });

        setFolders(Object.values(folderMap));
        setFormsWithoutFolder(formsWithoutFolder);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

 const handleVerify = async () => {
  setStudentIdError("");
  if (!studentIdInput.trim()) return setStudentIdError("Vui lòng nhập MSSV");
  if (!/^[A-Za-z0-9]{11}$/.test(studentIdInput)) return setStudentIdError("Vui lòng kiểm tra lại mã số sinh viên");

  setIsVerifying(true);
  try {
    const res = await fetch(`http://localhost:8000/api/scrape-element?url=https://online.tdc.edu.vn/Portlets/Uis_Myspace/Professor/Marks.aspx?StudentID=${studentIdInput}&selector=span#lbInfo`);
    const result = await res.json();
    console.log(result.data);

    // Tìm chuỗi chứa "[Mã số: ...]"
    const matchedLine = result.data.find(line => line.includes("[Mã số:"));

    if (matchedLine) {
      const matched = matchedLine.match(/\[Mã số:\s*(\w+)\]/);
      if (matched && matched[1] === studentIdInput) {
        setVerifiedStudentId(studentIdInput);
        sessionStorage.setItem(STUDENT_ID_SESSION_KEY, studentIdInput);
        return;
      }
    }

    setStudentIdError("Mã số sinh viên không tồn tại");
  } catch (err) {
    setStudentIdError("Lỗi khi xác thực");
  } finally {
    setIsVerifying(false);
  }
};

  const toggleFolder = (folderId) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center text-blue-700">Tạo và In Biểu Mẫu</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="md:w-1/3 bg-white rounded-xl shadow p-6 overflow-auto max-h-[80vh]"
        >
          <h2 className="text-lg font-bold text-gray-700 mb-4">Chọn biểu mẫu</h2>

          {!verifiedStudentId ? (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nhập MSSV "
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                className="w-full border rounded px-4 py-2"
              />
              <button
                onClick={handleVerify}
                className="w-full bg-blue-600 text-white rounded px-4 py-2"
                disabled={isVerifying}
              >
                {isVerifying ? "Đang xác thực..." : "Xác thực MSSV"}
              </button>
              {studentIdError && <p className="text-red-500 text-sm">{studentIdError}</p>}
            </div>
          ) : (
            <>
              <div className="bg-green-100 p-3 rounded mb-4 text-sm">
                MSSV xác thực: <strong>{verifiedStudentId}</strong>
                <button
                  onClick={() => {
                    setVerifiedStudentId(null);
                    sessionStorage.removeItem(STUDENT_ID_SESSION_KEY);
                    setSelectedTemplateId(null);
                    setStudentIdInput("");
                  }}
                  className="text-blue-600 ml-2 underline"
                >
                  Thay đổi
                </button>
              </div>

              {loading ? (
                <p>Đang tải...</p>
              ) : (
                <div className="space-y-2">
                  {/* Hiển thị forms không có folder trước (nếu có) */}
                  {formsWithoutFolder.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                        <DocumentTextIcon className="h-5 w-5 text-blue-500" /> Biểu mẫu độc lập
                      </h3>
                      <ul className="ml-5 space-y-1">
                        {formsWithoutFolder.map((form) => (
                          <li key={form.id}>
                            <button
                              onClick={() => setSelectedTemplateId(form.id)}
                              className={`w-full text-left px-3 py-1 rounded text-sm flex items-center gap-2 ${
                                selectedTemplateId === form.id
                                  ? "bg-blue-600 text-white font-semibold"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                              }`}
                            >
                              <DocumentTextIcon className="h-4 w-4" /> {form.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Hiển thị folders và forms trong folder */}
                  {folders.map((folder) => (
                    <div key={folder.id} className="border-b border-gray-200 pb-2 mb-2 last:border-b-0">
                      <button
                        onClick={() => toggleFolder(folder.id)}
                        className="w-full text-left font-semibold text-gray-700 flex items-center gap-2 py-2 hover:bg-gray-50 rounded"
                      >
                        {openFolders[folder.id] ? (
                          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                        )}
                        <FolderIcon className="h-5 w-5 text-yellow-500" /> {folder.name}
                      </button>
                      {openFolders[folder.id] && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-5 mt-2 space-y-1"
                        >
                          {folder.forms.length > 0 ? (
                            folder.forms.map((form) => (
                              <li key={form.id}>
                                <button
                                  onClick={() => setSelectedTemplateId(form.id)}
                                  className={`w-full text-left px-3 py-1 rounded text-sm flex items-center gap-2 ${
                                    selectedTemplateId === form.id
                                      ? "bg-blue-600 text-white font-semibold"
                                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  <DocumentTextIcon className="h-4 w-4" /> {form.name}
                                </button>
                              </li>
                            ))
                          ) : (
                            <li className="text-gray-500 text-sm italic py-1 px-3">Không có biểu mẫu nào trong thư mục này.</li>
                          )}
                        </motion.ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="md:flex-grow bg-white rounded-xl shadow p-6"
        >
          {!verifiedStudentId ? (
            <p className="text-center text-gray-600 py-10">
              Vui lòng xác thực MSSV để xem và điền biểu mẫu.
            </p>
          ) : selectedTemplateId ? (
            <FormDetailStudent key={selectedTemplateId} selectedId={selectedTemplateId} />
          ) : (
            <p className="text-center text-gray-600 py-10">
              Vui lòng chọn một biểu mẫu từ danh sách bên trái.
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}