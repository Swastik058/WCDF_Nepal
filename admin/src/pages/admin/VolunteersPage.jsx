import { useEffect, useState } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatDate } from '../../utils/adminFormat';

function VolunteersPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewNote, setReviewNote] = useState('');

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getVolunteers({ search, status: statusFilter });
      setApplications(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch volunteer applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const handleReview = async (id, status) => {
    setError('');
    try {
      await adminApi.updateVolunteerStatus(id, { status, reviewNote });
      setReviewNote('');
      await loadApplications();
    } catch (err) {
      setError(err.message || 'Failed to update volunteer status');
    }
  };

  return (
    <div>
      <PageHeader title="Volunteer Approval" description="Review applications and approve or reject volunteers" />

      <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button type="button" onClick={loadApplications} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          Apply Filters
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Review Note (optional)</span>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            rows={2}
            placeholder="Shared note for approval or rejection"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
        </label>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <TableState
          loading={loading}
          error={error && applications.length === 0 ? error : ''}
          empty={!loading && applications.length === 0}
          emptyText="No volunteer applications found."
        />

        {!loading && applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Applied</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100">
                    <td className="py-2">{item.fullName}</td>
                    <td className="py-2">{item.email}</td>
                    <td className="py-2">{item.phone || '-'}</td>
                    <td className="py-2 capitalize">{item.status}</td>
                    <td className="py-2">{formatDate(item.createdAt)}</td>
                    <td className="py-2">
                      {item.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleReview(item._id, 'approved')} className="text-emerald-600 hover:underline">
                            Approve
                          </button>
                          <button type="button" onClick={() => handleReview(item._id, 'rejected')} className="text-rose-600 hover:underline">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {error && applications.length > 0 ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </div>
    </div>
  );
}

export default VolunteersPage;
