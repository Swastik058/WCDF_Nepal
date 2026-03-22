import { useEffect, useMemo, useState } from 'react';
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
  const [selectedId, setSelectedId] = useState('');
  const [reviewForm, setReviewForm] = useState({
    adminRemarks: '',
    rejectionReason: '',
  });
  const [submittingId, setSubmittingId] = useState('');

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getVolunteers({ search, status: statusFilter });
      setApplications(data);

      if (data.length && !selectedId) {
        setSelectedId(data[0]._id);
      }

      if (data.length && selectedId && !data.some((item) => item._id === selectedId)) {
        setSelectedId(data[0]._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch volunteer applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const selectedApplication = useMemo(
    () => applications.find((item) => item._id === selectedId) || null,
    [applications, selectedId],
  );

  useEffect(() => {
    if (!selectedApplication) {
      setReviewForm({ adminRemarks: '', rejectionReason: '' });
      return;
    }

    setReviewForm({
      adminRemarks: selectedApplication.adminRemarks || '',
      rejectionReason: selectedApplication.rejectionReason || '',
    });
  }, [selectedApplication]);

  const handleReview = async (status) => {
    if (!selectedApplication) return;

    if (status === 'rejected' && !reviewForm.rejectionReason.trim()) {
      setError('Rejection reason is required when rejecting a volunteer application.');
      return;
    }

    setError('');
    setSubmittingId(selectedApplication._id);

    try {
      await adminApi.updateVolunteerStatus(selectedApplication._id, {
        status,
        adminRemarks: reviewForm.adminRemarks,
        rejectionReason: reviewForm.rejectionReason,
      });

      await loadApplications();
    } catch (err) {
      setError(err.message || 'Failed to update volunteer status');
    } finally {
      setSubmittingId('');
    }
  };

  const summary = applications.reduce(
    (acc, item) => {
      acc.total += 1;
      acc[item.status] += 1;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 },
  );

  return (
    <div>
      <PageHeader title="Volunteer Approval" description="Review volunteer applications and approve or reject access" />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Visible Applications</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-sm text-amber-700">Pending</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">{summary.pending}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-sm text-emerald-700">Approved</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{summary.approved}</p>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <p className="text-sm text-rose-700">Rejected</p>
          <p className="mt-2 text-2xl font-bold text-rose-900">{summary.rejected}</p>
        </div>
      </div>

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
          <option value="">All Statuses</option>
        </select>

        <button type="button" onClick={loadApplications} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          Apply Filters
        </button>
      </div>

      {error ? <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
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
                  </tr>
                </thead>
                <tbody>
                  {applications.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => setSelectedId(item._id)}
                      className={`cursor-pointer border-t border-slate-100 ${selectedId === item._id ? 'bg-slate-50' : ''}`}
                    >
                      <td className="py-2 font-medium text-slate-900">{item.fullName}</td>
                      <td className="py-2">{item.email}</td>
                      <td className="py-2">{item.phone || '-'}</td>
                      <td className="py-2 capitalize">{item.status}</td>
                      <td className="py-2">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {!selectedApplication ? (
            <p className="text-sm text-slate-600">Select an application to view full details.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedApplication.fullName}</h2>
                  <p className="text-sm text-slate-600">{selectedApplication.email}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                  {selectedApplication.status}
                </span>
              </div>

              <div className="grid gap-3 text-sm text-slate-700">
                <p><span className="font-semibold text-slate-900">Phone:</span> {selectedApplication.phone}</p>
                <p><span className="font-semibold text-slate-900">Address:</span> {selectedApplication.address}</p>
                <p><span className="font-semibold text-slate-900">Availability:</span> {selectedApplication.availability}</p>
                <p><span className="font-semibold text-slate-900">Skills:</span> {selectedApplication.skills?.length ? selectedApplication.skills.join(', ') : 'No skills added'}</p>
                <p><span className="font-semibold text-slate-900">Applied At:</span> {formatDate(selectedApplication.createdAt)}</p>
                <p><span className="font-semibold text-slate-900">Volunteer Hours:</span> {selectedApplication.volunteerHours || 0}</p>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Reason For Joining</p>
                <p className="mt-2 text-sm text-slate-700">{selectedApplication.reasonForJoining}</p>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Previous Experience</p>
                <p className="mt-2 text-sm text-slate-700">{selectedApplication.previousExperience || 'No previous experience provided.'}</p>
              </div>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-slate-700">Admin Remarks</span>
                <textarea
                  value={reviewForm.adminRemarks}
                  onChange={(e) => setReviewForm((current) => ({ ...current, adminRemarks: e.target.value }))}
                  rows={3}
                  placeholder="Add notes visible with the volunteer application"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-slate-700">Rejection Reason</span>
                <textarea
                  value={reviewForm.rejectionReason}
                  onChange={(e) => setReviewForm((current) => ({ ...current, rejectionReason: e.target.value }))}
                  rows={3}
                  placeholder="Required when rejecting an application"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                />
              </label>

              {selectedApplication.status === 'pending' ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={submittingId === selectedApplication._id}
                    onClick={() => handleReview('approved')}
                    className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-70"
                  >
                    {submittingId === selectedApplication._id ? 'Saving...' : 'Approve Volunteer'}
                  </button>
                  <button
                    type="button"
                    disabled={submittingId === selectedApplication._id}
                    onClick={() => handleReview('rejected')}
                    className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-70"
                  >
                    {submittingId === selectedApplication._id ? 'Saving...' : 'Reject Volunteer'}
                  </button>
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p><span className="font-semibold text-slate-900">Reviewed At:</span> {selectedApplication.reviewedAt ? formatDate(selectedApplication.reviewedAt) : 'Not reviewed'}</p>
                  <p className="mt-2"><span className="font-semibold text-slate-900">Approved At:</span> {selectedApplication.approvedAt ? formatDate(selectedApplication.approvedAt) : 'Not approved'}</p>
                  <p className="mt-2"><span className="font-semibold text-slate-900">Saved Remarks:</span> {selectedApplication.adminRemarks || 'None'}</p>
                  <p className="mt-2"><span className="font-semibold text-slate-900">Saved Rejection Reason:</span> {selectedApplication.rejectionReason || 'None'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VolunteersPage;
