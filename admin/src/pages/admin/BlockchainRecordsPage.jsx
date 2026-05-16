import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import PageHeader from '../../components/admin/PageHeader';
import TableState from '../../components/admin/TableState';
import { adminApi } from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/adminFormat';

const shortHash = (hash) => {
  if (!hash || hash.length < 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

function BlockchainRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [purging, setPurging] = useState(false);

  const purgeStale = async () => {
    if (!window.confirm('Delete all blockchain records whose transaction hashes are not found on the running Hardhat node?')) return;
    setPurging(true);
    try {
      const result = await adminApi.purgeStaleBlockchainRecords();
      alert(result.message);
      loadRecords();
    } catch (err) {
      alert(`Purge failed: ${err.message}`);
    } finally {
      setPurging(false);
    }
  };

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

  const downloadAuditPdf = async () => {
    setDownloadingReport(true);
    try {
      const data = await adminApi.getBlockchainAuditReport({});
      const { records: auditRecords, totalRecords, totalAmount, generatedAt } = data;

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header banner
      doc.setFillColor(15, 59, 53);
      doc.rect(0, 0, pageWidth, 72, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('WCDF Nepal — Blockchain Audit Report', 40, 30);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date(generatedAt).toLocaleString()}`, 40, 50);
      doc.text(
        `Total Records: ${totalRecords}   |   Total Amount: NPR ${Number(totalAmount).toLocaleString()}`,
        40,
        65,
      );

      // Tamper-proof notice
      doc.setFillColor(240, 249, 244);
      doc.rect(0, 72, pageWidth, 28, 'F');
      doc.setTextColor(22, 101, 52);
      doc.setFontSize(9);
      doc.text(
        'These records are sourced exclusively from the immutable blockchain ledger and cannot be altered.',
        40,
        91,
      );

      // Column positions
      const colX = [40, 165, 265, 355, 445, 520];
      const headers = ['Donation ID', 'Donor', 'Blockchain Amt', 'MongoDB Amt', 'Status', 'Date'];
      let y = 120;

      doc.setFillColor(30, 80, 72);
      doc.rect(0, y - 14, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      headers.forEach((h, i) => doc.text(h, colX[i], y));

      y += 16;
      doc.setTextColor(30, 30, 30);

      auditRecords.forEach((rec, idx) => {
        if (y > 760) {
          doc.addPage();
          y = 40;
        }

        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(0, y - 12, pageWidth, 18, 'F');
        }

        const isTampered =
          rec.mongoAmount != null &&
          Math.round(Number(rec.mongoAmount) * 100) !== Math.round(Number(rec.amount) * 100);

        doc.setFontSize(7.5);
        doc.setTextColor(30, 30, 30);
        doc.text(String(rec.donationReference || '').slice(-12), colX[0], y);
        doc.text(String(rec.donorName || 'N/A').slice(0, 16), colX[1], y);
        doc.text(`NPR ${Number(rec.amount || 0).toLocaleString()}`, colX[2], y);
        doc.text(
          rec.mongoAmount != null ? `NPR ${Number(rec.mongoAmount).toLocaleString()}` : '—',
          colX[3],
          y,
        );

        doc.setTextColor(isTampered ? 185 : 21, isTampered ? 28 : 128, isTampered ? 28 : 61);
        doc.text(isTampered ? 'Tampered' : 'Verified', colX[4], y);
        doc.setTextColor(30, 30, 30);
        doc.text(rec.recordedDate ? new Date(rec.recordedDate).toLocaleDateString() : '—', colX[5], y);

        y += 18;
      });

      // Page footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}  |  WCDF Nepal Blockchain Audit`,
          pageWidth / 2,
          830,
          { align: 'center' },
        );
      }

      doc.save(`blockchain-audit-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      alert(`Failed to generate PDF: ${err.message}`);
    } finally {
      setDownloadingReport(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const tamperedCount = records.filter((r) => r.verificationStatus === 'Tampered').length;
  const offlineCount = records.filter((r) => r.verificationStatus === 'Verified (offline)').length;

  return (
    <div>
      <PageHeader
        title="Blockchain Verification"
        description="Compare MongoDB amounts against immutable blockchain records to detect tampering"
      />

      <div className="mb-4 space-y-3">
        <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadRecords()}
            placeholder="Search by hash, donation reference or donor name"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={loadRecords}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Search
          </button>
          <button
            type="button"
            onClick={downloadAuditPdf}
            disabled={downloadingReport || records.length === 0}
            className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {downloadingReport ? 'Generating PDF…' : 'Download Audit PDF'}
          </button>
          <button
            type="button"
            onClick={purgeStale}
            disabled={purging}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
            title="Delete MongoDB records whose tx hashes no longer exist on the blockchain node"
          >
            {purging ? 'Purging…' : 'Purge Stale Records'}
          </button>
        </div>

        {tamperedCount > 0 && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-800">
            Warning: {tamperedCount} record{tamperedCount > 1 ? 's' : ''} show a mismatch between
            MongoDB and blockchain amounts.
          </div>
        )}

        {offlineCount > 0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            Note: {offlineCount} record{offlineCount > 1 ? 's' : ''} verified from stored snapshot — amounts shown are correct but live chain confirmation unavailable (start Hardhat node to enable live verification).
          </div>
        )}

        {records.length > 0 && tamperedCount === 0 && offlineCount === 0 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            All {records.length} record{records.length > 1 ? 's' : ''} verified — MongoDB amounts
            match blockchain data.
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <TableState
          loading={loading}
          error={error}
          empty={!loading && records.length === 0}
          emptyText="No blockchain records found."
        />

        {!loading && records.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-2 px-3">Donation ID</th>
                  <th className="py-2 px-3">MongoDB Amt</th>
                  <th className="py-2 px-3">Blockchain Amt</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Tx Hash</th>
                  <th className="py-2 px-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((item) => {
                  const isTampered = item.verificationStatus === 'Tampered';
                  return (
                    <tr
                      key={item._id}
                      className={`border-t border-slate-100 ${isTampered ? 'bg-red-50 hover:bg-red-100' : item.verificationStatus === 'Verified (offline)' ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-2 px-3 font-mono text-xs text-slate-600">
                        {String(item.donationId || item.donationReference || '').slice(-10)}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {item.mongoAmount != null ? (
                          `NPR ${formatCurrency(item.mongoAmount)}`
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {item.blockchainAmount != null ? (
                          `NPR ${formatCurrency(item.blockchainAmount)}`
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {isTampered ? (
                          <span className="inline-flex items-center rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            Tampered
                          </span>
                        ) : item.verificationStatus === 'Verified (offline)' ? (
                          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            Verified (offline)
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            Verified
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className="cursor-default font-mono text-xs text-slate-600"
                          title={item.transactionHash}
                        >
                          {shortHash(item.transactionHash)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-slate-500">{formatDate(item.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlockchainRecordsPage;
