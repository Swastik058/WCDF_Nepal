import { useEffect, useState } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/adminFormat';

function DonationsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  const loadDonations = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getDonations({ ...filters, page, limit: 15 });
      setItems(data.items || []);
      setMeta({ page: data.page || 1, pages: data.pages || 1, total: data.total || 0 });
    } catch (err) {
      setError(err.message || 'Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations(1);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadDonations(1);
  };

  return (
    <div>
      <PageHeader title="Donations Monitoring" description="View and filter donation transactions" />

      <form onSubmit={handleSubmit} className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-3 lg:grid-cols-6">
        <input name="search" value={filters.search} onChange={handleFilterChange} placeholder="Donor, email, tx id" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select name="status" value={filters.status} onChange={handleFilterChange} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <input name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="minAmount" type="number" min="0" step="0.01" value={filters.minAmount} onChange={handleFilterChange} placeholder="Min amount" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input name="maxAmount" type="number" min="0" step="0.01" value={filters.maxAmount} onChange={handleFilterChange} placeholder="Max amount" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />

        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 md:col-span-3 lg:col-span-6">
          Apply Filters
        </button>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm text-slate-600">Total records: {meta.total}</div>

        <TableState loading={loading} error={error} empty={!loading && items.length === 0} emptyText="No donations found." />

        {!loading && items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="py-2">Donor</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Transaction</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} className="border-t border-slate-100">
                      <td className="py-2">{item.donorName}</td>
                      <td className="py-2">{item.email}</td>
                      <td className="py-2">{formatCurrency(item.amount)}</td>
                      <td className="py-2 capitalize">{item.status}</td>
                      <td className="py-2">{item.transactionId || '-'}</td>
                      <td className="py-2">{formatDate(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => loadDonations(meta.page - 1)}
                className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {meta.page} of {meta.pages}
              </span>
              <button
                type="button"
                disabled={meta.page >= meta.pages}
                onClick={() => loadDonations(meta.page + 1)}
                className="rounded-md border border-slate-300 px-3 py-1.5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default DonationsPage;
