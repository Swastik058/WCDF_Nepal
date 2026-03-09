import { useEffect, useState } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/adminFormat';

function BlockchainRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getBlockchainRecords({ search });
      setRecords(data);
    } catch (err) {
      setError(err.message || 'Failed to load blockchain records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <div>
      <PageHeader title="Blockchain Records" description="View transaction hash and donation reference records" />

      <div className="mb-4 flex gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by hash or donation reference"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button type="button" onClick={loadRecords} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
          Search
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <TableState loading={loading} error={error} empty={!loading && records.length === 0} emptyText="No blockchain records found." />

        {!loading && records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Donation Ref</th>
                  <th className="py-2">Transaction Hash</th>
                  <th className="py-2">Network</th>
                  <th className="py-2">Donation Amount</th>
                  <th className="py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {records.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100">
                    <td className="py-2">{item.donationReference}</td>
                    <td className="py-2">{item.transactionHash}</td>
                    <td className="py-2">{item.network}</td>
                    <td className="py-2">{formatCurrency(item.donationId?.amount || 0)}</td>
                    <td className="py-2">{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default BlockchainRecordsPage;
