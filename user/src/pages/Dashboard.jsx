import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getUserDonations } from "../services/donationService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import "./Dashboard.css";

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

  /* =========================
     AUTH GUARD
  ========================= */
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  /* =========================
     FETCH DONATIONS ON MOUNT
  ========================= */
  useEffect(() => {
    if (user) {
      fetchDonations();
    }
  }, [user]);

  /* =========================
     PAYMENT SUCCESS HANDLER
  ========================= */
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const errorReason = searchParams.get("reason");
    const errorType = searchParams.get("error");

    if (paymentStatus === "success") {
      console.log('Payment success detected - fetching fresh data from database');
      setShowSuccessMessage(true);

      // Fetch fresh donation data from database with delay to ensure backend processing is complete
      setTimeout(() => {
        fetchDonations();
      }, 1000);

      // Auto-hide message
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 8000);

      // Remove query param safely
      window.history.replaceState({}, "", "/dashboard");

      return () => clearTimeout(timer);
      
    } else if (paymentStatus === "failed") {
      console.log('Payment failure detected:', { errorReason, errorType });
      
      let errorMessage = 'Payment failed. Please try again.';
      if (errorReason) {
        errorMessage = `Payment failed: ${errorReason}`;
      } else if (errorType) {
        errorMessage = `Payment verification failed: ${errorType.replace(/_/g, ' ')}`;
      }
      
      setError(errorMessage);
      
      // Still fetch donations to show current state
      fetchDonations();
      
      // Remove query param safely
      window.history.replaceState({}, "", "/dashboard");
      
      // Clear error after 10 seconds
      setTimeout(() => {
        setError('');
      }, 10000);
    }
  }, [searchParams]);

  /* =========================
     FETCH DONATIONS
  ========================= */
  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await getUserDonations();
      const list = response?.donations || [];

      setDonations(list);

      // Calculate stats
      const completed = list.filter((d) => d.status === "completed");
      const pending = list.filter((d) => d.status === "pending");

      setStats({
        totalDonations: list.length,
        totalAmount: completed.reduce((sum, d) => sum + d.amount, 0),
        completedDonations: completed.length,
        pendingDonations: pending.length,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  /* =========================
     HELPERS
  ========================= */
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
      completed: "status-completed",
      pending: "status-pending",
      failed: "status-failed",
    };
    return <span className={`status-badge ${map[status]}`}>{status}</span>;
  };

  /* =========================
     LOADING STATE
  ========================= */
  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-loading">
          <Loader />
          <p>Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        {/* SUCCESS MESSAGE */}
        {showSuccessMessage && (
          <div className="success-notification">
            <div className="success-content">
              <span className="success-icon-small">Success</span>
              <span>Payment completed successfully! Your donation has been processed and saved. Check your donation history below for details.</span>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user?.name}</h1>
            <p>Your donation history & impact</p>
          </div>
          <button className="new-donation-btn" onClick={() => navigate("/donate")}>
            + New Donation
          </button>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalDonations}</h3>
            <p>Total Donations</p>
          </div>
          <div className="stat-card">
            <h3>NPR {stats.totalAmount.toLocaleString()}</h3>
            <p>Total Amount</p>
          </div>
          <div className="stat-card">
            <h3>{stats.completedDonations}</h3>
            <p>Completed</p>
          </div>
          <div className="stat-card">
            <h3>{stats.pendingDonations}</h3>
            <p>Pending</p>
          </div>
        </div>

        {/* DONATIONS */}
        <div className="donations-section">
          <h2>Recent Donations</h2>

          {error && <div className="error-message">{error}</div>}

          {donations.length === 0 ? (
            <div className="empty-state">
              <p>No donations yet.</p>
              <button onClick={() => navigate("/donate")}>
                Make Your First Donation
              </button>
            </div>
          ) : (
            donations.map((donation) => (
              <div key={donation._id} className="donation-card">
                <div className="donation-header">
                  <strong>{donation.purpose}</strong>
                  <span>NPR {donation.amount.toLocaleString()}</span>
                </div>

                <div className="donation-meta">
                  <span>{formatDate(donation.createdAt)}</span>
                  <span>{donation.paymentMethod}</span>
                </div>

                {donation.transactionId && (
                  <p className="txn-id">
                    TXN: {donation.transactionId}
                  </p>
                )}

                <div className="donation-footer">
                  {getStatusBadge(donation.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Dashboard;
