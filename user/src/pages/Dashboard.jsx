import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserDonations } from "../services/donationService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    completedDonations: 0,
    pendingDonations: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchDonations();
    }
  }, [user]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const errorReason = searchParams.get("reason");
    const errorType = searchParams.get("error");

    if (paymentStatus === "success") {
      setShowSuccessMessage(true);
      setTimeout(() => {
        fetchDonations();
      }, 1000);

      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 8000);

      window.history.replaceState({}, "", "/dashboard");
      return () => clearTimeout(timer);
    }

    if (paymentStatus === "failed") {
      let errorMessage = "Payment failed. Please try again.";
      if (errorReason) errorMessage = `Payment failed: ${errorReason}`;
      else if (errorType) errorMessage = `Payment verification failed: ${errorType.replace(/_/g, " ")}`;

      setError(errorMessage);
      fetchDonations();
      window.history.replaceState({}, "", "/dashboard");

      setTimeout(() => {
        setError("");
      }, 10000);
    }
  }, [searchParams]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await getUserDonations();
      const list = response?.donations || [];

      setDonations(list);

      const completed = list.filter((d) => d.status === "completed");
      const pending = list.filter((d) => d.status === "pending");

      setStats({
        totalDonations: list.length,
        totalAmount: completed.reduce((sum, d) => sum + d.amount, 0),
        completedDonations: completed.length,
        pendingDonations: pending.length,
      });
    } catch (err) {
      setError("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadge = (status) => {
    const map = {
      completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      pending: 'border-amber-200 bg-amber-50 text-amber-700',
      failed: 'border-rose-200 bg-rose-50 text-rose-700',
    };

    return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${map[status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Loader />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {showSuccessMessage && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="rounded bg-emerald-600 px-2 py-1 text-xs font-bold uppercase text-white">Success</span>
              <span className="text-sm font-medium">Payment completed successfully! Your donation has been processed and saved. Check your donation history below for details.</span>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-teal-900">Welcome, {user?.name}</h1>
            <p className="mt-1 text-slate-600">Your donation history and impact.</p>
          </div>
          <button onClick={() => navigate('/donate')} className="rounded-lg bg-gradient-to-r from-teal-700 to-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
            + New Donation
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow"><p className="text-3xl font-bold text-teal-900">{stats.totalDonations}</p><p className="mt-1 text-sm text-slate-600">Total Donations</p></div>
          <div className="rounded-2xl bg-white p-5 shadow"><p className="text-3xl font-bold text-teal-900">NPR {stats.totalAmount.toLocaleString()}</p><p className="mt-1 text-sm text-slate-600">Total Amount</p></div>
          <div className="rounded-2xl bg-white p-5 shadow"><p className="text-3xl font-bold text-teal-900">{stats.completedDonations}</p><p className="mt-1 text-sm text-slate-600">Completed</p></div>
          <div className="rounded-2xl bg-white p-5 shadow"><p className="text-3xl font-bold text-teal-900">{stats.pendingDonations}</p><p className="mt-1 text-sm text-slate-600">Pending</p></div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-teal-900">Recent Donations</h2>

          {error && <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

          {donations.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-slate-600">No donations yet.</p>
              <button onClick={() => navigate('/donate')} className="mt-4 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                Make Your First Donation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div key={donation._id} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <strong className="text-lg text-teal-900">{donation.purpose}</strong>
                    <span className="text-lg font-bold text-teal-900">NPR {donation.amount.toLocaleString()}</span>
                  </div>

                  <div className="mb-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
                    <span>{formatDate(donation.createdAt)}</span>
                    <span>{donation.paymentMethod}</span>
                  </div>

                  {donation.transactionId && (
                    <p className="mb-3 text-xs text-slate-500">TXN: {donation.transactionId}</p>
                  )}

                  <div>{getStatusBadge(donation.status)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;