import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";
import { getUserDonations } from "../services/donationService";
import { getVolunteerStatus } from "../services/volunteerService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import VolunteerStatusPanel from "../components/VolunteerStatusPanel";

function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [donations, setDonations] = useState([]);
  const [volunteerStatus, setVolunteerStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [volunteerError, setVolunteerError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [previewDonation, setPreviewDonation] = useState(null);

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      setVolunteerError("");

      const [donationResult, volunteerResult] = await Promise.allSettled([
        getUserDonations(),
        getVolunteerStatus(),
      ]);

      if (donationResult.status === "rejected") {
        throw new Error("Failed to load donations");
      }

      const list = donationResult.value?.donations || [];
      setDonations(list);

      const completed = list.filter((d) => d.status === "completed");
      const pending = list.filter((d) => d.status === "pending");

      setStats({
        totalDonations: list.length,
        totalAmount: completed.reduce((sum, d) => sum + d.amount, 0),
        completedDonations: completed.length,
        pendingDonations: pending.length,
      });

      if (volunteerResult.status === "fulfilled") {
        const volunteerResponse = volunteerResult.value;
        setVolunteerStatus(volunteerResponse);

        if (
          user &&
          (
            user.volunteerStatus !== (volunteerResponse?.status || "not_applied") ||
            !!user.isVolunteer !== !!volunteerResponse?.isVolunteer ||
            (user.volunteerApprovedAt || null) !== (volunteerResponse?.approvedAt || null)
          )
        ) {
          updateUser({
            ...user,
            volunteerStatus: volunteerResponse?.status || "not_applied",
            isVolunteer: !!volunteerResponse?.isVolunteer,
            volunteerApprovedAt: volunteerResponse?.approvedAt || null,
          });
        }
      } else {
        setVolunteerError(volunteerResult.reason?.message || "Failed to load volunteer status");
      }
    } catch (err) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const errorReason = searchParams.get("reason");
    const errorType = searchParams.get("error");

    if (paymentStatus === "success") {
      setShowSuccessMessage(true);
      setPreviewDonation(null);
      setTimeout(() => {
        fetchDashboardData();
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
      fetchDashboardData();
      window.history.replaceState({}, "", "/dashboard");

      setTimeout(() => {
        setError("");
      }, 10000);
    }
  }, [searchParams]);

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
      completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
      pending: "border-amber-200 bg-amber-50 text-amber-700",
      failed: "border-rose-200 bg-rose-50 text-rose-700",
    };

    return (
      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${map[status] || "border-slate-200 bg-slate-50 text-slate-600"}`}>
        {status}
      </span>
    );
  };

  const formatReceiptDate = (date) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const downloadReceiptPdf = (donation) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFillColor(4, 77, 65);
    doc.rect(40, 35, 520, 90, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("WCDF Nepal", 60, 65);
    doc.setFontSize(11);
    doc.text("Together for children and women in Nepal", 60, 82);

    doc.setFillColor(22, 163, 74);
    doc.roundedRect(420, 45, 130, 30, 6, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("SUCCESS", 485, 65, { align: "center" });

    const details = [
      [`Receipt ID:`, donation._id],
      [`Donor Name:`, donation.donorName],
      [`Donor Email:`, donation.email],
      [`Amount:`, `NPR ${donation.amount.toLocaleString()}`],
      [`Purpose:`, donation.purpose],
      [`Payment Method:`, donation.paymentMethod],
      [`Transaction ID:`, donation.transactionId || "N/A"],
      [`Donation Status:`, donation.status],
      [`Donation Date:`, formatReceiptDate(donation.createdAt)],
    ];

    let y = 145;
    doc.setTextColor(34, 54, 74);
    doc.setFontSize(12);

    details.forEach(([label, value]) => {
      doc.text(label, 60, y);
      doc.setFont(undefined, "bold");
      doc.text(String(value), 180, y);
      doc.setFont(undefined, "normal");
      y += 22;
    });

    doc.setFontSize(10);
    doc.setTextColor(102, 116, 138);
    doc.text("Thank you for supporting our work. Your gift helps vulnerable children and women build a safer future.", 60, y + 24, { maxWidth: 460 });

    doc.save(`donation-receipt-${donation._id}.pdf`);
  };

  const latestCompletedDonation = donations
    .filter((d) => d.status === "completed")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];


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
        {showSuccessMessage ? (
          <div className="mb-6 rounded-3xl border border-teal-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-700" />
                  Payment Successful
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-teal-900">Donation Receipt</h2>
                  <p className="text-sm text-slate-600">Your receipt is ready. Preview it before downloading.</p>
                </div>
              </div>
              {latestCompletedDonation ? (
                <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
                  <button
                    onClick={() => setPreviewDonation(latestCompletedDonation)}
                    className="inline-flex items-center justify-center rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                  >
                    View Receipt
                  </button>
                </div>
              ) : null}
            </div>

            {latestCompletedDonation ? (
              <p className="mt-4 text-sm text-slate-600">Click "View Receipt" to preview your receipt before downloading.</p>
            ) : (
              <p className="mt-4 text-sm text-slate-600">Receipt preview will appear once your completed donation details are loaded.</p>
            )}
          </div>
        ) : null}

        {previewDonation ? (
          <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow">
              <div className="bg-emerald-700 px-6 py-6 text-white">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-emerald-200">WCDF Nepal</p>
                    <h2 className="mt-2 text-3xl font-bold">Donation Receipt</h2>
                    <p className="mt-1 max-w-xl text-sm text-emerald-100">
                      Official receipt for your generous gift to women and children in Nepal.
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    <span className="inline-flex rounded-full bg-emerald-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
                      Success
                    </span>
                    <button
                      onClick={() => downloadReceiptPdf(previewDonation)}
                      className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-slate-100"
                    >
                      Download PDF Receipt
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Receipt ID</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{previewDonation._id}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Date</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{formatReceiptDate(previewDonation.createdAt)}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Amount</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">NPR {previewDonation.amount.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Payment Method</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{previewDonation.paymentMethod}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Donor</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{previewDonation.donorName}</p>
                      <p className="mt-1 text-sm text-slate-600">{previewDonation.email}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Purpose</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{previewDonation.purpose}</p>
                      {previewDonation.transactionId ? (
                        <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">Transaction ID</p>
                      ) : null}
                      {previewDonation.transactionId ? (
                        <p className="mt-1 text-sm font-semibold text-slate-900">{previewDonation.transactionId}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-900">Thank you for supporting our mission.</p>
                  <p className="mt-2 text-sm text-slate-600">
                    This receipt is your official confirmation of a successful donation and can be used for your records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-teal-900">Welcome, {user?.name}</h1>
            <p className="mt-1 text-slate-600">Your donation history, user dashboard, and volunteer status.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => navigate("/donate")} className="rounded-lg bg-gradient-to-r from-teal-700 to-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110">
              + New Donation
            </button>
            <button
              onClick={() => navigate(volunteerStatus?.status === "approved" ? "/volunteer/dashboard" : "/volunteer/apply")}
              className="rounded-lg border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-500 hover:text-emerald-800"
            >
              {volunteerStatus?.status === "approved" ? "Volunteer Dashboard" : "Become a Volunteer"}
            </button>
          </div>
        </div>

        <div className="mb-6">
          {volunteerError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {volunteerError}
            </div>
          ) : (
            <VolunteerStatusPanel statusData={volunteerStatus} compact />
          )}
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow"><p className="text-3xl font-bold text-teal-900">{stats.totalDonations}</p><p className="mt-1 text-sm text-slate-600">Total Donations</p></div>
          <div className="rounded-2xl bg-white p-5 shadow"><p className="text-3xl font-bold text-teal-900">NPR {stats.totalAmount.toLocaleString()}</p><p className="mt-1 text-sm text-slate-600">Total Amount</p></div>
          <div className="rounded-2xl bg-white p-5 shadow"><p className="text-3xl font-bold text-teal-900">{stats.completedDonations}</p><p className="mt-1 text-sm text-slate-600">Completed</p></div>
          <div className="rounded-2xl bg-white p-5 shadow"><p className="text-3xl font-bold text-teal-900">{stats.pendingDonations}</p><p className="mt-1 text-sm text-slate-600">Pending</p></div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold text-teal-900">Recent Donations</h2>

          {error ? <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}

          {donations.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-slate-600">No donations yet.</p>
              <button onClick={() => navigate("/donate")} className="mt-4 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
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

                  {donation.transactionId ? (
                    <p className="mb-3 text-xs text-slate-500">TXN: {donation.transactionId}</p>
                  ) : null}

                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div>{getStatusBadge(donation.status)}</div>
                    {donation.status === "completed" ? (
                      <button
                        onClick={() => setPreviewDonation(donation)}
                        className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900"
                      >
                        View Receipt
                      </button>
                    ) : null}
                  </div>
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
