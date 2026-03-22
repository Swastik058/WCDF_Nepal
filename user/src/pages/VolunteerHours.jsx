import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { getMyTrackingHistory, getVolunteerDashboard } from "../services/volunteerService";

function VolunteerHours() {
  const [data, setData] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHours = async () => {
      try {
        const [dashboardResponse, historyResponse] = await Promise.all([
          getVolunteerDashboard(),
          getMyTrackingHistory(),
        ]);
        setData(dashboardResponse);
        setTrackingHistory(historyResponse);
      } catch (err) {
        setError(err.message || "Failed to load volunteer hours");
      } finally {
        setLoading(false);
      }
    };

    loadHours();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        {loading ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <Loader />
            <p className="text-slate-600">Loading volunteer hours...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>
        ) : (
          <div className="rounded-3xl bg-white p-8 shadow">
            <h1 className="text-3xl font-bold text-teal-900">Volunteer Hours</h1>
            <p className="mt-2 text-slate-600">Track your total approved volunteer hours.</p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <p className="text-sm text-emerald-700">Total Volunteer Hours</p>
                <p className="mt-2 text-4xl font-bold text-emerald-800">{data?.summary?.volunteerHours || 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-600">Recent Activity Entries</p>
                <p className="mt-2 text-4xl font-bold text-slate-900">{data?.summary?.recentActivityCount || 0}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              Hours are currently managed from the volunteer record in the admin system. As admins assign and complete work, this page updates automatically.
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-slate-900">Official Tracking Records</h2>
              {trackingHistory.length ? (
                <div className="space-y-3">
                  {trackingHistory.map((item) => (
                    <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <p className="font-semibold text-slate-900">{item.activityId?.title || "Activity record"}</p>
                      <p className="mt-1 text-sm text-slate-600 capitalize">Status: {item.participationStatus}</p>
                      <p className="mt-1 text-sm text-slate-600">Hours Completed: {item.hoursCompleted}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.remarks || "No remarks added."}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  No tracked volunteer hours yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default VolunteerHours;
