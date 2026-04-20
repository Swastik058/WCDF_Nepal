import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../components/admin/PageHeader';
import { adminApi } from '../../services/adminApi';

const CHART_COLORS = ['#0f766e', '#f59e0b', '#2563eb', '#10b981', '#ef4444', '#8b5cf6'];

const EMPTY_STATS = {
  totalDonations: 0,
  totalDonors: 0,
  totalPrograms: 0,
  totalVolunteers: 0,
  sponsoredChildren: 0,
  donationsOverTime: [],
  donationsByProgram: [],
  recentSponsorshipNotifications: [],
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

const normalizeStats = (payload) => {
  if (!payload) {
    return EMPTY_STATS;
  }

  return {
    totalDonations: Number(payload.totalDonations || payload.cards?.totalDonations || 0),
    totalDonors: Number(payload.totalDonors || 0),
    totalPrograms: Number(payload.totalPrograms || 0),
    totalVolunteers: Number(payload.totalVolunteers || payload.cards?.totalVolunteers || 0),
    sponsoredChildren: Number(payload.sponsoredChildren || payload.cards?.sponsoredChildren || 0),
    donationsOverTime: Array.isArray(payload.donationsOverTime) ? payload.donationsOverTime : [],
    donationsByProgram: Array.isArray(payload.donationsByProgram) ? payload.donationsByProgram : [],
    recentSponsorshipNotifications: Array.isArray(payload.recentSponsorshipNotifications) ? payload.recentSponsorshipNotifications : [],
  };
};

function SummaryCard({ label, value, accentClass, helperText }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">{helperText}</p>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function EmptyChartState({ message }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
      {message}
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardStats = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminApi.getDashboardStats();
      setStats(normalizeStats(response));
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard stats');
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const donationDistribution = stats.donationsByProgram.map((item) => ({
    name: item.program,
    value: item.amount,
  }));

  const hasLineData = stats.donationsOverTime.length > 0;
  const hasProgramData = stats.donationsByProgram.length > 0;

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Live donation insights, sponsorship updates, and volunteer overview."
        actions={(
          <button
            type="button"
            onClick={loadDashboardStats}
            disabled={loading}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        )}
      />

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Total Donations"
          value={formatCurrency(stats.totalDonations)}
          helperText="Completed donations"
          accentClass="bg-gradient-to-r from-teal-500 to-emerald-500"
        />
        <SummaryCard
          label="Total Donors"
          value={formatCompactNumber(stats.totalDonors)}
          helperText="Unique contributors"
          accentClass="bg-gradient-to-r from-amber-400 to-orange-500"
        />
        <SummaryCard
          label="Total Programs"
          value={formatCompactNumber(stats.totalPrograms)}
          helperText="Active programs"
          accentClass="bg-gradient-to-r from-blue-500 to-cyan-500"
        />
        <SummaryCard
          label="Total Volunteers"
          value={formatCompactNumber(stats.totalVolunteers)}
          helperText="Approved volunteers"
          accentClass="bg-gradient-to-r from-emerald-500 to-lime-500"
        />
        <SummaryCard
          label="Sponsored Children"
          value={formatCompactNumber(stats.sponsoredChildren)}
          helperText="Completed sponsorships"
          accentClass="bg-gradient-to-r from-fuchsia-500 to-pink-500"
        />
      </div>

      <div className="mt-6">
        <ChartCard
          title="Donations Over Time"
          description="Track how total completed donations move month by month."
        >
          {loading ? (
            <EmptyChartState message="Loading donation trends..." />
          ) : hasLineData ? (
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.donationsOverTime} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={formatCompactNumber} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Donations"
                    stroke="#0f766e"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#0f766e' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState message="No donation trend data available yet." />
          )}
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Donations Per Program"
          description="Compare the amount raised across donation purposes or programs."
        >
          {loading ? (
            <EmptyChartState message="Loading program totals..." />
          ) : hasProgramData ? (
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.donationsByProgram} margin={{ top: 8, right: 16, left: 8, bottom: 32 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="program"
                    stroke="#64748b"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={70}
                  />
                  <YAxis stroke="#64748b" tickFormatter={formatCompactNumber} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" name="Amount" radius={[10, 10, 0, 0]}>
                    {stats.donationsByProgram.map((item, index) => (
                      <Cell key={`${item.program}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState message="No program donation data available yet." />
          )}
        </ChartCard>

        <ChartCard
          title="Donation Distribution"
          description="See how donations are split across active funding areas."
        >
          {loading ? (
            <EmptyChartState message="Loading donation distribution..." />
          ) : hasProgramData ? (
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donationDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={78}
                    outerRadius={118}
                    paddingAngle={3}
                  >
                    {donationDistribution.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState message="No donation distribution data available yet." />
          )}
        </ChartCard>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Recent Sponsorship Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">Latest child sponsorship activity from the donation flow.</p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Loading sponsorship notifications...
          </div>
        ) : stats.recentSponsorshipNotifications.length > 0 ? (
          <div className="space-y-3">
            {stats.recentSponsorshipNotifications.map((item) => (
              <div key={item._id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{item.message}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Child: {item.childName} | Sponsored by: {item.sponsoredBy}
                  </p>
                </div>
                <span className="text-sm text-slate-500">{formatDateTime(item.createdAt)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
            No sponsorship notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
