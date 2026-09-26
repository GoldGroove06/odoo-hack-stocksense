function ErrorBanner({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="mb-4 flex items-start justify-between gap-3 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      <p>{message}</p>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-red-700 hover:text-red-900"
          aria-label="Dismiss"
        >
          ×
        </button>
      ) : null}
    </div>
  )
}

export default ErrorBanner
