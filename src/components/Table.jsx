import React from "react";
import { Link } from "react-router-dom";

function Table({ headers, data, actions }) {
 
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200">
          {headers.map((header, index) => (
            <th key={index} className="border p-2">{header}</th>
          ))}
          {actions && <th className="border p-2">Hành động</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((e, index) => (
          <>
            {e.form_request?.map((value, i) => (
              <tr key={index}>
                <td className="border p-2">{e.name}</td>
                <td className="border p-2">
                  {new Date(value.created_at).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="border p-2">Đang chờ</td>
                <td className="border p-2">
                  <Link to={`/forms/${e.id}/preview-form/${value.id}`} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
          </>

        ))}
      </tbody>
    </table>
  );
}

export default Table;