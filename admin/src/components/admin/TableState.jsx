function TableState({ loading, error, empty, emptyText = 'No data found.' }) {
  if (loading) {
    return <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading...</div>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (empty) {
    return <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">{emptyText}</div>;
  }

  return null;
}

export default TableState;
