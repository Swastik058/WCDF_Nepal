import { useEffect, useState } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatCurrency } from '../../utils/adminFormat';

function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getReports(filters);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <PageHeader title="Reports" description="Generate donation, expense, and summary reports" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          loadReport();
        }}
        className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3"
      >
        <input name="startDate" type="date" value={filters.startDate} onChange={handleChange} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="endDate" type="date" value={filters.endDate} onChange={handleChange} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          Generate
        </button>
      </form>

      <TableState loading={loading} error={error} empty={!loading && !report} />

      {!loading && !error && report ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Donations Total</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(report.summary.donationTotalAmount)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Expenses Total</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(report.summary.expenseTotalAmount)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Net Balance</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{formatCurrency(report.summary.netBalance)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Pending Volunteers</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">{report.summary.pendingVolunteers}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Monthly Donations</h2>
              {report.monthlyDonations?.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="py-2">Month</th>
                        <th className="py-2">Count</th>
                        <th className="py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.monthlyDonations.map((item) => (
                        <tr key={`d-${item._id.year}-${item._id.month}`} className="border-t border-slate-100">
                          <td className="py-2">{item._id.month}/{item._id.year}</td>
                          <td className="py-2">{item.totalCount}</td>
                          <td className="py-2">{formatCurrency(item.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No donation data for selected range.</p>
              )}
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Monthly Expenses</h2>
              {report.monthlyExpenses?.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="py-2">Month</th>
                        <th className="py-2">Count</th>
                        <th className="py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.monthlyExpenses.map((item) => (
                        <tr key={`e-${item._id.year}-${item._id.month}`} className="border-t border-slate-100">
                          <td className="py-2">{item._id.month}/{item._id.year}</td>
                          <td className="py-2">{item.totalCount}</td>
                          <td className="py-2">{formatCurrency(item.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No expense data for selected range.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default ReportsPage;
