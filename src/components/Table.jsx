import React from "react";

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
        {data.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((value, i) => (
              <td key={i} className="border p-2">{value}</td>
            ))}
            {actions && (
              <td className="border p-2">
                {actions.map((action, i) => (
                  <a key={i} href={action.link} className={action.className}>
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