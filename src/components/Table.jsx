export default function Table({ activeTab, columns, data }) {


return (
    <div className="w-full overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#0F2744]/10 ">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id ?? rowIndex}
                  className="transition hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm text-gray-700"
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}