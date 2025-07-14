import React, { useState } from 'react';

// FormTreeItem Component
// Added onLayout prop to handle navigation to Layout page
const FormTreeItem = ({ item, onEdit, onDelete, onAddChild, onLayout, depth = 0, showMessage }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate left padding for indentation
    const paddingLeft = `${depth * 1.5}rem`; // 1.5rem per depth level

    return (
        <div className="flex flex-col">
            <div className="flex items-center py-2 px-3 rounded-md hover:bg-gray-50 transition-colors duration-200" style={{ paddingLeft }}>
                {/* Expand/Collapse Toggle for Folders */}
                {item.isFolder && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mr-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                    >
                        {isExpanded ? (
                            <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg> // Chevron down
                        ) : (
                            <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg> // Chevron right
                        )}
                    </button>
                )}
                {/* Icon for Folder or File */}
                <span className="mr-2 text-gray-500">
                    {item.isFolder ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg> // Folder icon
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> // Document icon
                    )}
                </span>
                {/* Item Name */}
                <span className="flex-grow text-sm font-medium text-gray-800">{item.name}</span>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {item.isFolder && (
                        <button
                            onClick={() => onAddChild(item.id, item.name)}
                            className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors duration-200"
                        >
                            Add
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(item.id, item.name, item.isFolder, item.parentId)}
                        className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors duration-200"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(item.id, item.name, item.isFolder)}
                        className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors duration-200"
                    >
                        Delete
                    </button>
                    {!item.isFolder && (
                        <button
                            onClick={() => onLayout(item.id)} // Gọi onLayout và truyền item.id
                            className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors duration-200"
                        >
                            Layout
                        </button>
                    )}
                </div>
            </div>
            {/* Render Children if Expanded and Children Exist */}
            {isExpanded && item.children && item.children.length > 0 && (
                <div className="pl-4 border-l border-gray-200 ml-2"> {/* Visual indentation for children */}
                    {item.children.map((child) => (
                        <FormTreeItem
                            key={child.id}
                            item={child}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddChild={onAddChild}
                            onLayout={onLayout} // Truyền onLayout xuống các FormTreeItem con
                            depth={depth + 1}
                            showMessage={showMessage}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FormTreeItem;