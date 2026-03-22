import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { getVolunteerDashboard } from "../services/volunteerService";

function VolunteerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await getVolunteerDashboard();
        setData(response);
      } catch (err) {
        setError(err.message || "Failed to load volunteer dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Not available";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        {loading ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <Loader />
            <p className="text-slate-600">Loading volunteer dashboard...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white p-8 shadow lg:flex-row lg:items-center lg:justify-between">
              <div>
                <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
                  Approved Volunteer
                </span>
                <h1 className="mt-3 text-3xl font-bold text-teal-900">{data?.volunteer?.fullName}</h1>
                <p className="mt-2 text-slate-600">
                  Approved on {formatDate(data?.volunteer?.approvedAt)}. Manage your volunteer work from here.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/volunteer/profile" className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                  View Profile
                </Link>
                <Link to="/volunteer/activities" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400">
                  Assigned Activities
                </Link>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-5 shadow">
                <p className="text-sm text-slate-500">Volunteer Hours</p>
                <p className="mt-2 text-3xl font-bold text-teal-900">{data?.summary?.volunteerHours || 0}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow">
                <p className="text-sm text-slate-500">Assigned Events</p>
                <p className="mt-2 text-3xl font-bold text-teal-900">{data?.summary?.assignedEventsCount || 0}</p>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow">
                <p className="text-sm text-slate-500">Recent Activity</p>
                <p className="mt-2 text-3xl font-bold text-teal-900">{data?.summary?.recentActivityCount || 0}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-teal-900">Assigned Events</h2>
                  <Link to="/volunteer/activities" className="text-sm font-semibold text-teal-700 hover:underline">
                    View all
                  </Link>
                </div>

                {data?.assignedEvents?.length ? (
                  <div className="space-y-3">
                    {data.assignedEvents.slice(0, 4).map((event, index) => (
                      <div key={`${event.title}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{event.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{event.location || "Location to be confirmed"}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatDate(event.eventDate)} • <span className="capitalize">{event.status}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                    No assigned events yet.
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-teal-900">Recent Volunteer Activity</h2>
                  <Link to="/volunteer/hours" className="text-sm font-semibold text-teal-700 hover:underline">
                    View hours
                  </Link>
                </div>

                {data?.recentActivity?.length ? (
                  <div className="space-y-3">
                    {data.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={`${activity.title}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{activity.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{activity.description}</p>
                        <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{formatDate(activity.activityDate)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                    No recent volunteer activity yet.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default VolunteerDashboard;
