function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-gray-600">
      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
      {label}
    </div>
  )
}

export default LoadingState
