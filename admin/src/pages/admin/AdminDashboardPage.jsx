import { useEffect, useState } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/adminFormat';

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.getDashboard();
      setData(response);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Summary cards and recent activity"
        actions={(
          <button
            type="button"
            onClick={loadDashboard}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Refresh
          </button>
        )}
      />

      <TableState loading={loading} error={error} empty={false} />

      {!loading && !error && data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Total Donations" value={formatCurrency(data.cards.totalDonations)} />
            <StatCard label="Total Volunteers" value={data.cards.totalVolunteers} />
            <StatCard label="Total Children" value={data.cards.totalChildren} />
            <StatCard label="Total Events" value={data.cards.totalEvents} />
            <StatCard label="Total Expenses" value={formatCurrency(data.cards.totalExpenses)} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Recent Donations</h2>
              {data.recentDonations?.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="py-2">Donor</th>
                        <th className="py-2">Amount</th>
                        <th className="py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentDonations.map((donation) => (
                        <tr key={donation._id} className="border-t border-slate-100">
                          <td className="py-2">{donation.donorName}</td>
                          <td className="py-2">{formatCurrency(donation.amount)}</td>
                          <td className="py-2">{formatDate(donation.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No recent donations.</p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Pending Volunteer Approvals ({data.pendingVolunteerApprovals || 0})
              </h2>
              {data.pendingVolunteerList?.length ? (
                <ul className="mt-3 space-y-2 text-sm">
                  {data.pendingVolunteerList.map((item) => (
                    <li key={item._id} className="rounded-md border border-slate-100 p-2">
                      <p className="font-medium text-slate-900">{item.fullName}</p>
                      <p className="text-slate-600">{item.email}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No pending volunteer applications.</p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            {data.recentActivity?.length ? (
              <ul className="mt-3 space-y-2 text-sm">
                {data.recentActivity.map((item, index) => (
                  <li key={`${item.type}-${index}`} className="flex items-center justify-between rounded-md border border-slate-100 p-2">
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="text-slate-600">{item.meta}</p>
                    </div>
                    <span className="text-slate-500">{formatDate(item.createdAt)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No recent activity.</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default AdminDashboardPage;
