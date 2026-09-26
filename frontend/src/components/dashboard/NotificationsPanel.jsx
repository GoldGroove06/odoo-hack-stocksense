function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function NotificationsPanel({ notifications }) {
  return (
    <aside className="border border-gray-200 lg:w-72 lg:shrink-0">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
      </div>
      {!notifications?.length ? (
        <p className="px-4 py-6 text-sm text-gray-500">No updates.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {notifications.map((item) => (
            <li
              key={item.id}
              className={`px-4 py-3 ${item.read ? '' : 'border-l-2 border-l-gray-900 bg-gray-50'}`}
            >
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
              <p className="mt-0.5 text-xs text-gray-600">{item.body}</p>
              <p className="mt-1 text-xs text-gray-400">{formatTime(item.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

export default NotificationsPanel
