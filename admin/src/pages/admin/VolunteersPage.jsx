import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatDate } from '../../utils/adminFormat';

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
};

const TRACKING_BADGE = {
  assigned: 'bg-blue-100 text-blue-700',
  attended: 'bg-emerald-100 text-emerald-700',
  missed: 'bg-rose-100 text-rose-700',
  completed: 'bg-indigo-100 text-indigo-700',
};

function VolunteersPage() {
  const [activeTab, setActiveTab] = useState('applications');

  // ── Applications tab ─────────────────────────────────────────────────────────
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedId, setSelectedId] = useState('');
  const [reviewForm, setReviewForm] = useState({ adminRemarks: '', rejectionReason: '' });
  const [submittingId, setSubmittingId] = useState('');

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getVolunteers({ search, status: statusFilter });
      setApplications(data);
      if (data.length && !selectedId) setSelectedId(data[0]._id);
      if (data.length && selectedId && !data.some((item) => item._id === selectedId)) setSelectedId(data[0]._id);
    } catch (err) {
      setError(err.message || 'Failed to fetch volunteer applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'applications') loadApplications();
  }, [statusFilter, activeTab]);

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
    (acc, item) => { acc.total += 1; acc[item.status] += 1; return acc; },
    { total: 0, pending: 0, approved: 0, rejected: 0 },
  );

  // ── Manage Volunteers tab ─────────────────────────────────────────────────────
  const [volunteers, setVolunteers] = useState([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState('');
  const [manageSearch, setManageSearch] = useState('');
  const [selectedVolId, setSelectedVolId] = useState('');
  const [revokeForm, setRevokeForm] = useState({ open: false, reason: '' });
  const [revoking, setRevoking] = useState(false);
  const [hourForm, setHourForm] = useState({ hours: '', description: '' });
  const [loggingHours, setLoggingHours] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState('');

  const loadVolunteers = async () => {
    setManageLoading(true);
    setManageError('');
    try {
      const data = await adminApi.getVolunteers({ status: 'approved', search: manageSearch });
      setVolunteers(data);
      if (data.length && !selectedVolId) setSelectedVolId(data[0]._id);
      if (data.length && selectedVolId && !data.some((v) => v._id === selectedVolId)) setSelectedVolId(data[0]._id);
      if (!data.length) setSelectedVolId('');
    } catch (err) {
      setManageError(err.message || 'Failed to fetch volunteers');
    } finally {
      setManageLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'manage') loadVolunteers();
  }, [activeTab]);

  const selectedVolunteer = useMemo(
    () => volunteers.find((v) => v._id === selectedVolId) || null,
    [volunteers, selectedVolId],
  );

  const handleRevokeOpen = () => setRevokeForm({ open: true, reason: '' });
  const handleRevokeCancel = () => setRevokeForm({ open: false, reason: '' });

  const handleRevoke = async () => {
    if (!selectedVolunteer) return;
    if (!revokeForm.reason.trim()) {
      setManageError('Rejection reason is required to revoke volunteer status.');
      return;
    }
    setRevoking(true);
    setManageError('');
    try {
      await adminApi.updateVolunteerStatus(selectedVolunteer._id, {
        status: 'rejected',
        rejectionReason: revokeForm.reason,
      });
      setRevokeForm({ open: false, reason: '' });
      await loadVolunteers();
    } catch (err) {
      setManageError(err.message || 'Failed to revoke volunteer status');
    } finally {
      setRevoking(false);
    }
  };

  const handleLogHours = async (e) => {
    e.preventDefault();
    if (!selectedVolunteer) return;
    const parsed = Number(hourForm.hours);
    if (!hourForm.hours || Number.isNaN(parsed) || parsed < 0.25) {
      setManageError('Enter a valid number of hours (minimum 0.25).');
      return;
    }
    setLoggingHours(true);
    setManageError('');
    try {
      const updated = await adminApi.logManualHours(selectedVolunteer._id, {
        hours: parsed,
        description: hourForm.description,
      });
      setHourForm({ hours: '', description: '' });
      setVolunteers((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
    } catch (err) {
      setManageError(err.message || 'Failed to log hours');
    } finally {
      setLoggingHours(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!selectedVolunteer) return;
    setDeletingLogId(logId);
    setManageError('');
    try {
      const updated = await adminApi.deleteManualHourLog(selectedVolunteer._id, logId);
      setVolunteers((prev) => prev.map((v) => (v._id === updated._id ? updated : v)));
    } catch (err) {
      setManageError(err.message || 'Failed to delete hour log');
    } finally {
      setDeletingLogId('');
    }
  };

  const hoursPercent = selectedVolunteer
    ? Math.min(100, ((selectedVolunteer.volunteerHours || 0) / 10) * 100)
    : 0;

  return (
    <div>
      <PageHeader title="Volunteers" description="Review applications and manage approved volunteers" />

      {/* Tab navigation */}
      <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('applications')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'applications'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Applications
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manage')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'manage'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manage Volunteers
        </button>
      </div>

      {/* ── Applications tab ──────────────────────────────────────────────────── */}
      {activeTab === 'applications' && (
        <div>
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
                          <td className="py-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[item.status] || 'bg-slate-100 text-slate-700'}`}>
                              {item.status}
                            </span>
                          </td>
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
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${STATUS_BADGE[selectedApplication.status] || 'bg-slate-100 text-slate-700'}`}>
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
      )}

      {/* ── Manage Volunteers tab ─────────────────────────────────────────────── */}
      {activeTab === 'manage' && (
        <div>
          {/* Search bar */}
          <div className="mb-4 flex gap-3">
            <input
              value={manageSearch}
              onChange={(e) => setManageSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadVolunteers()}
              placeholder="Search by name or email"
              className="flex-1 max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={loadVolunteers}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Search
            </button>
          </div>

          {manageError ? (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{manageError}</div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            {/* Volunteer list */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Approved Volunteers
                {volunteers.length > 0 && (
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{volunteers.length}</span>
                )}
              </h3>

              <TableState
                loading={manageLoading}
                error={manageError && volunteers.length === 0 ? manageError : ''}
                empty={!manageLoading && volunteers.length === 0}
                emptyText="No approved volunteers found."
              />

              {!manageLoading && volunteers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="py-2 pr-3">Name</th>
                        <th className="py-2 pr-3">Email</th>
                        <th className="py-2 pr-3">Phone</th>
                        <th className="py-2 pr-3">Hours</th>
                        <th className="py-2">Approved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.map((v) => (
                        <tr
                          key={v._id}
                          onClick={() => setSelectedVolId(v._id)}
                          className={`cursor-pointer border-t border-slate-100 hover:bg-slate-50 ${selectedVolId === v._id ? 'bg-slate-50' : ''}`}
                        >
                          <td className="py-2 pr-3 font-medium text-slate-900">{v.fullName}</td>
                          <td className="py-2 pr-3 text-slate-600">{v.email}</td>
                          <td className="py-2 pr-3 text-slate-600">{v.phone || '-'}</td>
                          <td className="py-2 pr-3">
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                              {v.volunteerHours || 0}h
                            </span>
                          </td>
                          <td className="py-2 text-slate-500">{v.approvedAt ? formatDate(v.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>

            {/* Volunteer detail panel */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              {!selectedVolunteer ? (
                <p className="text-sm text-slate-600">Select a volunteer to view their profile.</p>
              ) : (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{selectedVolunteer.fullName}</h2>
                      <p className="text-sm text-slate-500">{selectedVolunteer.email}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
                      Active Volunteer
                    </span>
                  </div>

                  {/* Volunteer hours */}
                  <div className="rounded-md border border-indigo-200 bg-indigo-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-indigo-900">Volunteer Hours</span>
                      <span className="font-bold text-indigo-700">{selectedVolunteer.volunteerHours || 0} / 10 hrs</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${hoursPercent}%` }}
                      />
                    </div>
                    {(selectedVolunteer.volunteerHours || 0) >= 10 && (
                      <p className="mt-2 text-xs font-medium text-emerald-700">Certificate unlocked</p>
                    )}
                  </div>

                  {/* Profile info */}
                  <div className="grid gap-2 text-sm text-slate-700">
                    <p><span className="font-semibold text-slate-900">Phone:</span> {selectedVolunteer.phone || '-'}</p>
                    <p><span className="font-semibold text-slate-900">Address:</span> {selectedVolunteer.address || '-'}</p>
                    <p><span className="font-semibold text-slate-900">Availability:</span> {selectedVolunteer.availability || '-'}</p>
                    <p>
                      <span className="font-semibold text-slate-900">Skills:</span>{' '}
                      {selectedVolunteer.skills?.length ? (
                        <span className="ml-1 inline-flex flex-wrap gap-1">
                          {selectedVolunteer.skills.map((s) => (
                            <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{s}</span>
                          ))}
                        </span>
                      ) : 'No skills added'}
                    </p>
                    <p><span className="font-semibold text-slate-900">Approved At:</span> {selectedVolunteer.approvedAt ? formatDate(selectedVolunteer.approvedAt) : '-'}</p>
                  </div>

                  {/* Reason for joining */}
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason For Joining</p>
                    <p className="mt-1.5 text-sm text-slate-700">{selectedVolunteer.reasonForJoining || '-'}</p>
                  </div>

                  {/* Previous experience */}
                  {selectedVolunteer.previousExperience && (
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Previous Experience</p>
                      <p className="mt-1.5 text-sm text-slate-700">{selectedVolunteer.previousExperience}</p>
                    </div>
                  )}

                  {/* Assigned events */}
                  {selectedVolunteer.assignedEvents?.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-900">
                        Assigned Events
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{selectedVolunteer.assignedEvents.length}</span>
                      </p>
                      <div className="space-y-2">
                        {selectedVolunteer.assignedEvents.map((ev, idx) => (
                          <div key={ev._id || idx} className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                            <span className="font-medium text-slate-800">{ev.title || ev.name || 'Event'}</span>
                            {ev.date && <span className="text-xs text-slate-500">{formatDate(ev.date)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent activity */}
                  {selectedVolunteer.recentActivity?.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-900">Recent Activity</p>
                      <div className="space-y-1.5">
                        {selectedVolunteer.recentActivity.slice(0, 5).map((act, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                            <span>{act.message || act.description || String(act)}</span>
                            {act.createdAt && <span className="ml-auto shrink-0 text-slate-400">{formatDate(act.createdAt)}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Admin remarks */}
                  {selectedVolunteer.adminRemarks && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Admin Remarks</p>
                      <p className="mt-1.5 text-sm text-amber-800">{selectedVolunteer.adminRemarks}</p>
                    </div>
                  )}

                  {/* Manual hour tracking */}
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-900">Log Volunteer Hours</p>
                    <form onSubmit={handleLogHours} className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="mb-1 block text-xs font-medium text-slate-600">Hours</label>
                          <input
                            type="number"
                            step="0.25"
                            min="0.25"
                            value={hourForm.hours}
                            onChange={(e) => setHourForm((f) => ({ ...f, hours: e.target.value }))}
                            placeholder="e.g. 2.5"
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="flex-[2]">
                          <label className="mb-1 block text-xs font-medium text-slate-600">Description (optional)</label>
                          <input
                            type="text"
                            value={hourForm.description}
                            onChange={(e) => setHourForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="What did the volunteer do?"
                            maxLength={300}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loggingHours}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70"
                      >
                        {loggingHours ? 'Logging...' : 'Log Hours'}
                      </button>
                    </form>

                    {/* Manual hour logs list */}
                    {selectedVolunteer.manualHourLogs?.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Manual Hour Logs</p>
                        {selectedVolunteer.manualHourLogs.map((log) => (
                          <div
                            key={log._id}
                            className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-indigo-700">{log.hours} hr{log.hours !== 1 ? 's' : ''}</span>
                              {log.description && (
                                <span className="ml-2 text-slate-600">{log.description}</span>
                              )}
                              <p className="mt-0.5 text-xs text-slate-400">{formatDate(log.loggedAt)}</p>
                            </div>
                            <button
                              type="button"
                              disabled={deletingLogId === log._id}
                              onClick={() => handleDeleteLog(log._id)}
                              className="shrink-0 rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                            >
                              {deletingLogId === log._id ? '...' : 'Remove'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Revoke section */}
                  {!revokeForm.open ? (
                    <button
                      type="button"
                      onClick={handleRevokeOpen}
                      className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Revoke Volunteer Status
                    </button>
                  ) : (
                    <div className="rounded-md border border-rose-200 bg-rose-50 p-4 space-y-3">
                      <p className="text-sm font-semibold text-rose-800">Confirm Revoke</p>
                      <p className="text-xs text-rose-700">This will remove their volunteer access. They can re-apply.</p>
                      <label className="block text-sm">
                        <span className="mb-1 block font-medium text-rose-800">Rejection Reason (required)</span>
                        <textarea
                          value={revokeForm.reason}
                          onChange={(e) => setRevokeForm((f) => ({ ...f, reason: e.target.value }))}
                          rows={3}
                          placeholder="Provide a reason for revoking this volunteer's status"
                          className="w-full rounded-md border border-rose-300 bg-white px-3 py-2 text-sm outline-none focus:border-rose-500"
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={revoking}
                          onClick={handleRevoke}
                          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-70"
                        >
                          {revoking ? 'Revoking...' : 'Confirm Revoke'}
                        </button>
                        <button
                          type="button"
                          disabled={revoking}
                          onClick={handleRevokeCancel}
                          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-70"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteersPage;
