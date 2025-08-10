import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import FormDetailStudent from "../pages/Student/FormDetailStudent";
import FolderService from "../service/FolderService";
import FormTemplateService from "../service/FormTemplateService";
import { API_BASE_URL } from '../service/BaseUrl';
import Swal from 'sweetalert2';
import {
    FolderIcon,
    DocumentTextIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    UserCircleIcon,
    ClipboardDocumentCheckIcon,
    ArrowPathIcon,
    PaperClipIcon
} from "@heroicons/react/24/outline"; // Using outline for a cleaner look

const STUDENT_ID_SESSION_KEY = "verifiedStudentId";

// A small component for loading skeletons
const SkeletonLoader = ({ count = 3 }) => (
    <div className="space-y-4 animate-pulse">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="h-8 bg-slate-200 rounded-md"></div>
        ))}
    </div>
);

export default function ApplicationFormPage() {
    // --- STATE MANAGEMENT ---
    const [studentIdInput, setStudentIdInput] = useState("");
    const [studentEmailInput, setStudentEmailInput] = useState("");
    const [studentIdError, setStudentIdError] = useState("");
    const [studentEmailError, setStudentEmailError] = useState("");
    const [verifiedStudentId, setVerifiedStudentId] = useState(() => sessionStorage.getItem(STUDENT_ID_SESSION_KEY));
    const [tempNewStudentData, setTempNewStudentData] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRegisteringEmail, setIsRegisteringEmail] = useState(false);
    const [treeData, setTreeData] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [selectedItemName, setSelectedItemName] = useState("");
    const [selectedItemType, setSelectedItemType] = useState(null);
    const [currentNoteContent, setCurrentNoteContent] = useState("");
    const [isLoadingForms, setIsLoadingForms] = useState(true);
    const [openFolders, setOpenFolders] = useState({});

    // --- DATA FETCHING & PROCESSING ---
    const buildTree = (folders, forms) => {
        const map = new Map();
        const tree = [];
        const folderItems = folders.map(item => ({
            id: `folder-${item.id}`, name: item.name, type: 'folder',
            parentId: item.parent_id === item.id ? null : item.parent_id,
            children: []
        }));
        const formItems = forms.map(item => ({
            id: `form-${item.id}`, name: item.name, type: 'form',
            parentId: item.parent_id || null,
            noteContent: item.note, children: []
        }));

        const allItems = [...folderItems, ...formItems];
        allItems.forEach(item => map.set(item.id, item));
        allItems.forEach(item => {
            const parentId = `folder-${item.parentId}`;
            if (item.parentId === null || !map.has(parentId)) {
                tree.push(item);
            } else {
                map.get(parentId)?.children.push(item);
            }
        });

        const sortTree = (nodes) => {
            nodes.sort((a, b) => {
                const typeOrder = { 'folder': 1, 'form': 2 };
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
            const [folderList, allForms] = await Promise.all([
                FolderService.fetchForms(),
                FormTemplateService.fetchForms(),
            ]);
            const tree = buildTree(folderList, allForms);
            setTreeData(tree);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
            Swal.fire('Lỗi', 'Không thể tải danh sách biểu mẫu. Vui lòng thử lại sau.', 'error');
        } finally {
            setIsLoadingForms(false);
        }
    }, []);

    useEffect(() => {
        // Fetch data only if student is verified
        if(verifiedStudentId) {
            fetchData();
        }
    }, [verifiedStudentId, fetchData]);

    // --- API & BUSINESS LOGIC ---
    const sendWelcomeEmail = async (studentCode, studentName, studentEmail) => {
        // Implementation remains the same...
    };

    const handleVerify = async () => {
        setStudentIdError("");
        if (!studentIdInput.trim() || !/^[A-Za-z0-9]{11}$/.test(studentIdInput)) {
            setStudentIdError("MSSV không hợp lệ. Phải gồm 11 ký tự chữ và số.");
            return;
        }
        setIsVerifying(true);
        try {
            const scrapeResponse = await axios.get(`${API_BASE_URL}/scrape-element?url=https://online.tdc.edu.vn/Portlets/Uis_Myspace/Professor/Marks.aspx?StudentID=${studentIdInput}&selector=span#lbInfo`);
            const scrapeResult = scrapeResponse.data.data;
            const matchedLine = scrapeResult.find(line => line.includes("[Mã số:"));
            if (!matchedLine) {
                setStudentIdError("Không tìm thấy thông tin sinh viên phù hợp.");
                return;
            }
            const name = matchedLine.split("[Mã số")[0].trim();
            try {
                await axios.get(`${API_BASE_URL}/student/search/${studentIdInput}`);
                sessionStorage.setItem(STUDENT_ID_SESSION_KEY, studentIdInput);
                setVerifiedStudentId(studentIdInput);
            } catch (checkError) {
                if (checkError.response?.status === 404) {
                    setTempNewStudentData({ id: studentIdInput, name: name });
                } else { throw checkError; }
            }
        } catch (err) {
            console.error("Lỗi xác thực:", err);
            setStudentIdError(err.response?.data?.message || "Không thể xác thực. Vui lòng thử lại.");
        } finally {
            setIsVerifying(false);
            setStudentIdInput("");
        }
    };

    const handleRegisterNewStudent = async () => {
        setStudentEmailError("");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmailInput)) {
            setStudentEmailError("Địa chỉ email không hợp lệ.");
            return;
        }
        setIsRegisteringEmail(true);
        try {
            await axios.post(`${API_BASE_URL}/student`, {
                name: tempNewStudentData.name,
                student_code: tempNewStudentData.id.toLowerCase(),
                email: studentEmailInput,
            });
            await sendWelcomeEmail(tempNewStudentData.id, tempNewStudentData.name, studentEmailInput);
            sessionStorage.setItem(STUDENT_ID_SESSION_KEY, tempNewStudentData.id);
            setVerifiedStudentId(tempNewStudentData.id);
            setTempNewStudentData(null);
            setStudentEmailInput('');
        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            Swal.fire('Lỗi đăng ký', err.response?.data?.message || "Không thể lưu email.", 'error');
        } finally {
            setIsRegisteringEmail(false);
        }
    };

    // --- UI EVENT HANDLERS ---
    const toggleFolder = (folderId) => setOpenFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));

    const handleSelectItem = (item) => {
        setSelectedItemId(item.id);
        setSelectedItemName(item.name);
        setSelectedItemType(item.type);
        setCurrentNoteContent(item.noteContent || "");
    };

    const handleResetVerification = () => {
        sessionStorage.removeItem(STUDENT_ID_SESSION_KEY);
        setVerifiedStudentId(null);
        setTempNewStudentData(null);
        setSelectedItemId(null);
        setStudentIdInput("");
        setStudentIdError("");
        setStudentEmailInput("");
        setStudentEmailError("");
        setTreeData([]);
    };

    // --- RENDER LOGIC ---
    const renderTreeItems = (items) => {
        return items.map((item) => (
            <motion.div key={item.id} layout="position">
                {item.type === 'folder' ? (
                    <>
                        <button onClick={() => toggleFolder(item.id)} className="w-full text-left font-semibold text-slate-800 flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            {openFolders[item.id] ? <ChevronDownIcon className="h-5 w-5 text-slate-500" /> : <ChevronRightIcon className="h-5 w-5 text-slate-500" />}
                            <FolderIcon className="h-5 w-5 text-amber-500" /> {item.name}
                        </button>
                        <AnimatePresence>
                            {openFolders[item.id] && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }} className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-1">
                                    {item.children.length > 0 ? renderTreeItems(item.children) : (
                                        <li className="text-slate-500 text-sm italic py-1 px-3 list-none">Thư mục trống</li>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <li className="list-none">
                        <button onClick={() => handleSelectItem(item)}
                            className={`w-full text-left p-2 rounded-lg text-sm flex items-center gap-2.5 transition-all duration-200 ease-in-out ${selectedItemId === item.id ? "bg-blue-600 text-white font-medium shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                            {item.type === 'form' ? <DocumentTextIcon className="h-5 w-5 flex-shrink-0" /> : <ClipboardDocumentCheckIcon className="h-5 w-5 flex-shrink-0" />}
                            <span className="truncate">{item.name}</span>
                        </button>
                    </li>
                )}
            </motion.div>
        ));
    };

    const renderRightPanelContent = () => {
        if (!verifiedStudentId) {
            return (
                 <motion.div key="verify-prompt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center h-full text-center">
                    <UserCircleIcon className="h-24 w-24 text-slate-300" />
                    <h3 className="mt-4 text-xl font-semibold text-slate-800">Xác thực Sinh viên</h3>
                    <p className="mt-1 text-slate-500">
                        {tempNewStudentData ? 'Hoàn tất đăng ký ở khung bên trái để tiếp tục.' : 'Vui lòng xác thực Mã số sinh viên của bạn để tiếp tục.'}
                    </p>
                </motion.div>
            );
        }
        if (selectedItemType === 'form') {
            return (
                <motion.div key={selectedItemId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                    <div className="pb-4 mb-4 border-b border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800">{selectedItemName}</h2>
                    </div>
                    {currentNoteContent && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg mb-6">
                            <p className="font-semibold flex items-center gap-2"><PaperClipIcon className="h-5 w-5" /> Yêu cầu & Ghi chú</p>
                            <p className="mt-2 text-sm whitespace-pre-wrap">{currentNoteContent}</p>
                        </div>
                    )}
                    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                        <FormDetailStudent selectedId={selectedItemId.replace('form-', '')} studentId={verifiedStudentId} />
                    </div>
                </motion.div>
            );
        }
        // DEFAULT VIEW WHEN LOGGED IN BUT NOTHING IS SELECTED
        return (
            <motion.div key="no-item-selected" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center h-full text-center">
                <DocumentTextIcon className="h-24 w-24 text-slate-300" />
                <h3 className="mt-4 text-xl font-semibold text-slate-800">Bắt đầu</h3>
                <p className="mt-1 text-slate-500">Chọn một biểu mẫu từ danh sách bên trái để điền thông tin.</p>
            </motion.div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Cổng Biểu Mẫu Sinh Viên</h1>
                <p className="mt-2 text-lg text-slate-600">Xác thực, chọn và điền biểu mẫu một cách nhanh chóng.</p>
            </header>

            <main className="flex flex-col lg:flex-row gap-8">
                {/* --- LEFT SIDEBAR --- */}
                <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                    className="lg:w-1/3 xl:w-1/4 w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col space-y-6">

                    {/* Verification / Registration Section */}
                    <div>
                        <AnimatePresence mode="wait">
                            {!verifiedStudentId && !tempNewStudentData && (
                                <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                                    <label htmlFor="studentId" className="font-semibold text-slate-700">1. Xác thực MSSV</label>
                                    <input id="studentId" type="text" placeholder="Nhập Mã số sinh viên" value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value.trim())}
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" disabled={isVerifying}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }} />
                                    {studentIdError && <p className="text-red-600 text-sm">{studentIdError}</p>}
                                    <button onClick={handleVerify} disabled={isVerifying || !studentIdInput}
                                        className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                        {isVerifying ? <><ArrowPathIcon className="h-5 w-5 animate-spin" /> Đang xác thực...</> : "Xác thực"}
                                    </button>
                                </motion.div>
                            )}
                            {!verifiedStudentId && tempNewStudentData && (
                                <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 p-4 bg-blue-50 rounded-lg">
                                    <h3 className="font-semibold text-blue-800">Chào mừng, {tempNewStudentData.name}!</h3>
                                    <p className="text-sm text-blue-700">Vui lòng nhập email để hoàn tất đăng ký.</p>
                                    <input type="email" placeholder="Địa chỉ Email" value={studentEmailInput} onChange={(e) => setStudentEmailInput(e.target.value.trim())}
                                        className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" disabled={isRegisteringEmail}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleRegisterNewStudent(); }} />
                                    {studentEmailError && <p className="text-red-600 text-sm">{studentEmailError}</p>}
                                    <button onClick={handleRegisterNewStudent} disabled={isRegisteringEmail || !studentEmailInput}
                                        className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-blue-700 transition disabled:opacity-50">
                                        {isRegisteringEmail ? <><ArrowPathIcon className="h-5 w-5 animate-spin" /> Đang đăng ký...</> : "Hoàn tất"}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Form Tree Section - Renders only when verified */}
                    <AnimatePresence>
                        {verifiedStudentId && (
                            <motion.div
                                key="form-tree-section"
                                className="flex-grow flex flex-col min-h-0 space-y-6"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                <div className="border-t border-slate-200 pt-6">
                                    <div className="flex items-center justify-between p-3 bg-green-50 text-green-800 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <UserCircleIcon className="h-6 w-6" />
                                            <span className="font-semibold">{verifiedStudentId}</span>
                                        </div>
                                        <button onClick={handleResetVerification} className="text-sm font-medium text-blue-600 hover:underline">Đổi</button>
                                    </div>
                                </div>
                                <div className="flex-grow flex flex-col min-h-0">
                                    <h3 className="font-semibold text-slate-700 mb-3">2. Chọn Biểu Mẫu</h3>
                                    <div className="flex-grow overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                                        {isLoadingForms ? <SkeletonLoader /> : <ul className="space-y-1">{renderTreeItems(treeData)}</ul>}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.aside>

                {/* --- RIGHT CONTENT PANEL --- */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
                    className="flex-grow bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        {renderRightPanelContent()}
                    </AnimatePresence>
                </motion.section>
            </main>
        </div>
    );
}