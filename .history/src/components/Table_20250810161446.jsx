import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'; // Import icons for Edit and Delete

// Thêm onSort, sortColumn, sortDirection, onEdit, onDelete vào props
function Table({ headers, data, selectable, selectedItems, onSelectItem, onSelectAllItems, onUpdateStatus, sortColumn, sortDirection, onSort, onEdit, onDelete }) {
  const navigate = useNavigate();

  const isAllSelected = data.every(item => selectedItems.includes(item.id));

  const handleActionChange = (e, item) => {
    const selectedValue = e.target.value;
    e.target.value = ''; // Reset the select box to default option

    if (selectedValue === "view_detail") {
      navigate(`/admin/form-detail/${item.id}`);
    } else if (selectedValue.startsWith("status:")) {
      const newStatus = selectedValue.split(":")[1];
      // Truyền cả item.id, newStatus và selectedValue (hành động đầy đủ)
      onUpdateStatus(item.id, newStatus, selectedValue);
    }
  };

  const getColumnKey = (headerText) => {
    switch (headerText) {
      case "ID đơn": return "id";
      case "Tên sinh viên": return "student";
      case "Tên biểu mẫu": return "name";
      case "Ngày nộp": return "date";
      case "Ngày cập nhật": return "updatedDate";
      default: return null;
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-sky-200">
          <tr>
            {selectable && (
              <th className="p-4 w-16 text-center">
                <input
                  type="checkbox"
                  onChange={(e) => onSelectAllItems(e.target.checked)}
                  checked={data.length > 0 && isAllSelected}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </th>
            )}
            {headers.map((header, index) => {
              const columnKey = getColumnKey(header);
              const isSortable = columnKey !== null;

              return (
                <th
                  key={header}
                  className={`px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider
                    ${header === "ID đơn" ? "w-20" : ""}
                    ${header === "Tên sinh viên" ? "w-48" : ""}
                    ${header === "Mã số sinh viên" ? "w-32" : ""}
                    ${header === "Tên biểu mẫu" ? "w-48" : ""}
                    ${header === "Ngày nộp" ? "w-36" : ""}
                    ${header === "Trạng thái" ? "w-40" : ""}
                    ${header === "Hành động" ? "w-48" : ""}
                    ${isSortable ? "cursor-pointer select-none hover:bg-sky-300" : ""}
                  `}
                  onClick={() => isSortable && onSort(columnKey)}
                >
                  <div className="flex items-center justify-center">
                    {header}
                    {isSortable && (
                      <span className="ml-1">
                        {sortColumn === columnKey && sortDirection === 'asc' ? (
                          <ChevronUpIcon className="h-4 w-4 text-gray-600" />
                        ) : sortColumn === columnKey && sortDirection === 'desc' ? (
                          <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronUpIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
              {selectable && (
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => onSelectItem(item.id, e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
              )}
              <td className="px-6 py-4 text-base text-gray-800 truncate text-center">{item.id}</td>
              <td className="px-6 py-4 text-base text-gray-800 truncate">{item.student}</td>
              <td className="px-6 py-4 text-base text-gray-800 truncate text-center">{item.mssv}</td>
              <td className="px-6 py-4 text-base text-gray-800 truncate">{item.name}</td>
              <td className="px-6 py-4 text-base text-gray-800 truncate text-center">{item.date}</td>
              <td className="px-6 py-4 text-base text-gray-800 text-center">
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
                  ${item.status === "Đang chờ duyệt" ? "bg-yellow-200 text-yellow-800" : ""}
                  ${item.status === "Bổ sung" ? "bg-orange-200 text-orange-800" : ""}
                  ${item.status === "Đã duyệt" ? "bg-green-200 text-green-800" : ""}
                  ${item.status === "Đã hủy" ? "bg-red-200 text-red-800" : ""}
                `}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-center flex flex-col sm:flex-row items-center justify-center gap-2">
                <select
                  className="p-2 border border-gray-500 rounded-md bg-white text-base focus:ring-blue-500 focus:border-blue-500 shadow-sm w-full sm:w-auto text-black"
                  onChange={(e) => handleActionChange(e, item)}
                  defaultValue=""
                >
                  <option value="" disabled hidden>Chọn hành động</option>
                  <option value="view_detail">Xem chi tiết</option>
                  {item.status !== "Đang chờ duyệt" && <option value="status:Đang chờ duyệt">Chuyển Chờ Duyệt</option>}
                  {item.status !== "Bổ sung" && <option value="status:Bổ sung">Chuyển Bổ Sung</option>}
                  {item.status !== "Đã duyệt" && <option value="status:Đã duyệt">Chuyển Duyệt</option>}
                  {item.status !== "Đã hủy" && <option value="status:Đã hủy">Chuyển Hủy</option>}
                </select>
                {/* Nút Sửa */}
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 ease-in-out shadow-sm flex items-center justify-center w-full sm:w-auto"
                    title="Chỉnh sửa biểu mẫu"
                  >
                    <PencilIcon className="h-5 w-5" />
                    <span className="ml-1 sm:hidden">Sửa</span>
                  </button>
                )}
                {/* Nút Xóa */}
                {onDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-150 ease-in-out shadow-sm flex items-center justify-center w-full sm:w-auto"
                    title="Xóa biểu mẫu"
                  >
                    <TrashIcon className="h-5 w-5" />
                    <span className="ml-1 sm:hidden">Xóa</span>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
