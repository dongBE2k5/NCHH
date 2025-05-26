import React from "react";

function getStatusStyle(status) {
    switch (status) {
        case "Đã duyệt":
            return "bg-green-100 text-green-800";
        case "Đang chờ":
        case "Đang xử lý":
            return "bg-yellow-100 text-yellow-800";
        case "Từ chối":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

function Table({ headers, data, actions }) {
    return (
        <table className="min-w-full table-auto text-center align-middle">
            <thead>
                <tr className="bg-gray-200">
                    {headers.map((header, idx) => (
                        <th key={idx} className="text-center px-4 py-2">{header}</th>
                    ))}
                    {actions && actions.length > 0 && (
                        <th className="text-center px-4 py-2">Hành động</th>
                    )}
                </tr>
            </thead>
            <tbody>
                {data.map((row, idx) => (
                    <tr key={idx} className="border-b">
                        <td className="px-4 py-2">{row.name}</td>
                        <td className="px-4 py-2">{row.date}</td>
                        <td className="px-4 py-2">
                            <span
                                className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusStyle(row.status)}`}
                            >
                                {row.status}
                            </span>
                        </td>
                        {actions && actions.length > 0 && (
                            <td className="px-4 py-2">
                                {actions.map((action, aIdx) => (
                                    <a key={aIdx} href={action.link} className={action.className}>
                                        {action.label}
                                    </a>
                                ))}
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default Table;
