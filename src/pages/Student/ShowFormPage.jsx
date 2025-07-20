import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_BASE_URL } from '../../service/BaseUrl'; // Import API_BASE_URL
// FormDetailStudent is removed as per request
import FolderService from "../../service/FolderService"; // Assuming FolderService is in the same directory or adjust path
import NoteService from "../../service/NoteService"; // Assuming NoteService is in the same directory or adjust path
import FormTemplateService from "../../service/FormTemplateService"; // Assuming FormTemplateService is in the same directory or adjust path
import Swal from 'sweetalert2';
import {
    FolderIcon,
    DocumentTextIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ClipboardDocumentIcon, // Icon for notes in the list
    ArrowDownTrayIcon // Icon for download
} from "@heroicons/react/24/solid";

export default function ShowFormPage() {
    const [treeData, setTreeData] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [selectedItemName, setSelectedItemName] = useState("");
    const [selectedItemType, setSelectedItemType] = useState(null); // 'form' or 'note'

    const [currentNoteContent, setCurrentNoteContent] = useState(""); // State to hold the note content for the *selected form*
    const [currentPdfUrl, setCurrentPdfUrl] = useState(""); // State to hold the PDF URL for display
    const [currentPdfFileName, setCurrentPdfFileName] = useState(""); // State to hold the PDF filename for display
    // const [currentWordDownloadUrl, setCurrentWordDownloadUrl] = useState(""); // Removed: No longer needed for direct download

    const [isLoadingForms, setIsLoadingForms] = useState(true);
    const [openFolders, setOpenFolders] = useState({});

    // Function to build the tree data, now including notes and PDF URLs for forms
    const buildTree = (folders, forms, notes) => {
        const map = new Map();
        const tree = [];

        const folderItems = folders.map(item => ({
            id: `folder-${item.id}`, // Prefix folder IDs for consistency
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


    const toggleFolder = (folderId) => {
        setOpenFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId],
        }));
    };

    // Function to handle Word file download on click
    const handleWordDownload = async (formId, formName) => {
        try {
            // Directly make the GET request. The browser will handle the download
            // if the server sends the file with Content-Disposition header.
            const response = await axios.get(`${API_BASE_URL}/type-of-forms/word/${formId}`, {
                responseType: 'blob', // Important: tell axios to expect a binary response
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${formName}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            Swal.fire({
                icon: 'success',
                title: 'Đang tải xuống!',
                text: `File Word "${formName}.docx" đang được tải xuống.`,
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Lỗi khi tải file Word:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi tải Word!',
                text: 'Không thể tải file Word. Vui lòng thử lại.',
                confirmButtonText: 'Đóng',
            });
        }
    };

    // Updated handleSelectItem to handle PDF display
    const handleSelectItem = async (id, name, type, content = null) => {
        setSelectedItemId(id);
        setSelectedItemName(name);
        setSelectedItemType(type);
        setCurrentNoteContent(""); // Clear previous note content
        setCurrentPdfUrl(""); // Clear previous PDF URL
        setCurrentPdfFileName(""); // Clear previous PDF file name
        // setCurrentWordDownloadUrl(""); // Removed: No longer needed here

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
            const formOriginalId = id.replace('form-', '');

            // Fetch associated note (if any)
            try {
                const res = await NoteService.showFolder(formOriginalId); // Assuming API to get note by template ID
                if (res.data && res.data[0] && res.data[0].content) {
                    setCurrentNoteContent(res.data[0].content);
                } else {
                    setCurrentNoteContent("Không có ghi chú nào cho biểu mẫu này.");
                }
            } catch (error) {
                console.error("Lỗi khi tải ghi chú cho biểu mẫu:", error);
                setCurrentNoteContent("Lỗi khi tải ghi chú.");
            }

            // Fetch PDF URL for display
            try {
                const pdfRes = await axios.get(`${API_BASE_URL}/type-of-forms/pdf/${formOriginalId}`);
                if (pdfRes.data && pdfRes.data.url) {
                    setCurrentPdfUrl(pdfRes.data.url);
                    setCurrentPdfFileName(name + ".pdf");
                } else {
                    setCurrentPdfUrl("");
                    setCurrentPdfFileName("");
                    Swal.fire({
                        icon: 'warning',
                        title: 'Không tìm thấy PDF!',
                        text: 'Biểu mẫu này không có file PDF để xem trước.',
                        confirmButtonText: 'Đóng',
                    });
                }
            } catch (error) {
                console.error("Lỗi khi tải URL PDF:", error);
                setCurrentPdfUrl("");
                setCurrentPdfFileName("");
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi tải PDF!',
                    text: 'Không thể tải file PDF để xem trước. Vui lòng thử lại.',
                    confirmButtonText: 'Đóng',
                });
            }

            // No need to fetch Word URL here anymore, as download is handled by handleWordDownload directly
            // setCurrentWordDownloadUrl(""); // Ensure it's cleared if not used
        }
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
                            {/* Download button for Word file in the left panel */}
                            {item.type === 'form' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent selecting the item when clicking download
                                        handleWordDownload(item.id.replace('form-', ''), item.name);
                                    }}
                                    className="ml-auto p-1 rounded-full hover:bg-white hover:text-blue-600 transition-colors duration-200"
                                    title="Tải xuống file Word"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                </button>
                            )}
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
                        Xem Biểu Mẫu và Ghi Chú
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

                    {isLoadingForms ? (
                        <p className="text-center text-gray-500 py-10">
                            Đang tải biểu mẫu và ghi chú...
                        </p>
                    ) : (
                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                            {renderTreeItems(treeData)}
                        </div>
                    )}
                </motion.div>

                {/* Khu vực hiển thị PDF hoặc thông báo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="md:flex-grow w-full bg-white rounded-xl shadow p-6 flex flex-col"
                >
                    <AnimatePresence mode="wait">
                        {selectedItemType === 'form' && currentPdfUrl ? (
                            <motion.div
                                key="pdf-viewer"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col h-full"
                            >
                                <div className="mb-6 pb-4 border-b border-gray-200">
                                    {/* Display the note content here */}
                                    {currentNoteContent && currentNoteContent !== "Không có ghi chú nào cho biểu mẫu này." && (
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
                                        Đây là bản xem trước của biểu mẫu. Bạn có thể tải xuống nếu cần.
                                    </p>
                                </div>
                                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                                    <iframe
                                        src={currentPdfUrl}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none', minHeight: '500px' }}
                                        title="PDF Preview"
                                    >
                                        Trình duyệt của bạn không hỗ trợ hiển thị PDF.
                                        Bạn có thể <a href={currentPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">tải xuống PDF tại đây</a>.
                                    </iframe>
                                </div>
                                <div className="mt-4 text-center">
                                    {/* The main download button in the right panel now also calls handleWordDownload */}
                                    <button
                                        onClick={() => handleWordDownload(selectedItemId.replace('form-', ''), selectedItemName)}
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                    >
                                        <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                        Tải xuống {selectedItemName} (Word)
                                    </button>
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
                                    Vui lòng **chọn một biểu mẫu hoặc ghi chú** từ danh sách bên trái để xem.
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
