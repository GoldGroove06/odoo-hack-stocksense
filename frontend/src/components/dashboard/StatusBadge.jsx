function StatusBadge({ status }) {
  const label = String(status ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <span className="inline-block border border-gray-300 px-2 py-0.5 text-xs text-gray-700">
      {label || '—'}
    </span>
  )
}

export default StatusBadge
