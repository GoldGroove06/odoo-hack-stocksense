import StatusBadge from './StatusBadge.jsx'

function InternalTransfersSection({ transfers }) {
  const items = transfers?.items ?? []
  const pendingCount = transfers?.pendingCount ?? 0

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-900">Internal transfers</h2>
        <p className="text-xs text-gray-500">
          Pending: <span className="font-medium text-gray-800">{pendingCount}</span>
        </p>
      </div>
      {!items.length ? (
        <p className="border border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
          No scheduled transfers.
        </p>
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="border-b border-gray-200 px-3 py-2 font-medium">Reference</th>
                <th className="border-b border-gray-200 px-3 py-2 font-medium">From</th>
                <th className="border-b border-gray-200 px-3 py-2 font-medium">To</th>
                <th className="border-b border-gray-200 px-3 py-2 font-medium">Status</th>
                <th className="border-b border-gray-200 px-3 py-2 font-medium">Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="border-b border-gray-100 px-3 py-2 text-gray-900">{row.reference}</td>
                  <td className="border-b border-gray-100 px-3 py-2 text-gray-700">{row.fromLocation}</td>
                  <td className="border-b border-gray-100 px-3 py-2 text-gray-700">{row.toLocation}</td>
                  <td className="border-b border-gray-100 px-3 py-2">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="border-b border-gray-100 px-3 py-2 text-gray-700">{row.scheduledDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default InternalTransfersSection
