import { useCallback, useEffect, useState } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { expenseApi } from '../../services/adminApi';

const ACTION_LABELS = {
  created: { label: 'Created', color: 'bg-emerald-100 text-emerald-700' },
  updated: { label: 'Updated', color: 'bg-blue-100 text-blue-700' },
  deleted: { label: 'Deleted', color: 'bg-rose-100 text-rose-700' },
  receipt_uploaded: { label: 'Receipt Uploaded', color: 'bg-indigo-100 text-indigo-700' },
  receipt_deleted: { label: 'Receipt Deleted', color: 'bg-amber-100 text-amber-700' },
};

const ACTIONS = Object.keys(ACTION_LABELS);

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ExpenseAuditPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const loadLogs = useCallback(async (pg = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await expenseApi.getAuditLogs({ page: pg, limit: 25, action: filterAction });
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(pg);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [filterAction]);

  useEffect(() => { loadLogs(1); }, [loadLogs]);

  return (
    <div>
      <PageHeader
        title="Expense Audit Logs"
        description="Complete trail of all expense actions — creation, edits, deletions, and receipt changes"
      />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
        >
          <option value="">All Actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a].label}</option>
          ))}
        </select>
        <span className="text-xs text-slate-500">{total} log{total !== 1 ? 's' : ''} found</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <TableState
          loading={loading}
          error={error && logs.length === 0 ? error : ''}
          empty={!loading && logs.length === 0}
          emptyText="No audit logs found."
        />

        {!loading && logs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Expense</th>
                  <th className="px-4 py-3">Performed By</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Snapshot</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const actionMeta = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-slate-100 text-slate-600' };
                  const isExpanded = expandedId === log._id;
                  return (
                    <>
                      <tr key={log._id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${actionMeta.color}`}>
                            {actionMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[160px] truncate font-medium text-slate-800" title={log.expenseTitle}>
                          {log.expenseTitle || <span className="italic text-slate-400">Deleted expense</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <p className="font-medium">{log.performedByName || log.performedBy?.name || '—'}</p>
                          <p className="text-xs text-slate-400">{log.performedByEmail || log.performedBy?.email || ''}</p>
                        </td>
                        <td className="px-4 py-3 max-w-[200px] text-slate-600 text-xs" title={log.details}>
                          {log.details || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                          {log.ipAddress || '—'}
                        </td>
                        <td className="px-4 py-3">
                          {log.snapshot ? (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : log._id)}
                              className="rounded-md border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
                            >
                              {isExpanded ? 'Hide' : 'View'}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && log.snapshot && (
                        <tr key={`${log._id}-expanded`} className="bg-slate-50">
                          <td colSpan={7} className="px-6 py-3">
                            <pre className="rounded-md bg-slate-800 p-3 text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(log.snapshot, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">Page {page} of {pages} · {total} total entries</p>
            <div className="flex gap-2">
              <button
                onClick={() => loadLogs(page - 1)}
                disabled={page <= 1}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                onClick={() => loadLogs(page + 1)}
                disabled={page >= pages}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
