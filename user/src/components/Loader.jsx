function Loader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      <p className="text-sm text-slate-600">Loading...</p>
    </div>
  )
}

export default Loader