import StatusBadge from './StatusBadge.jsx'

function PendingReceiptsTable({ receipts }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-900">Pending receipts</h2>
      {!receipts?.length ? (
        <p className="border border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
          No pending receipts.
        </p>
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2 font-medium">Reference</th>
                <th className="border-b border-gray-200 px-3 py-2 font-medium">Partner</th>
                <th className="border-b border-gray-200 px-3 py-2 font-medium">Status</th>
                <th className="border-b border-gray-200 px-3 py-2 font-medium">Expected</th>
                <th className="border-b border-gray-200 px-3 py-2 font-medium">Lines</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="border-b border-gray-100 px-3 py-2 text-gray-900">{row.reference}</td>
                  <td className="border-b border-gray-100 px-3 py-2 text-gray-700">{row.partner}</td>
                  <td className="border-b border-gray-100 px-3 py-2">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="border-b border-gray-100 px-3 py-2 text-gray-700">{row.expectedDate}</td>
                  <td className="border-b border-gray-100 px-3 py-2 text-gray-700">{row.lines}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default PendingReceiptsTable
