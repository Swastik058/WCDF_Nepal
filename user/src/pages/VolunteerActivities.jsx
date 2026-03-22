import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { getMyAssignedActivities, getMyTrackingHistory } from "../services/volunteerService";

function VolunteerActivities() {
  const [activities, setActivities] = useState([]);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const [assignedActivities, history] = await Promise.all([
          getMyAssignedActivities(),
          getMyTrackingHistory(),
        ]);
        setActivities(assignedActivities);
        setTrackingHistory(history);
      } catch (err) {
        setError(err.message || "Failed to load volunteer activities");
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Date not set";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-10">
        {loading ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <Loader />
            <p className="text-slate-600">Loading assigned activities...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>
        ) : (
          <div className="rounded-3xl bg-white p-8 shadow">
            <h1 className="text-3xl font-bold text-teal-900">Assigned Activities</h1>
            <p className="mt-2 text-slate-600">Review assigned events and recent activity from your volunteer record.</p>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-bold text-slate-900">Assigned Events</h2>
                {activities.length ? (
                  <div className="space-y-4">
                    {activities.map((event) => (
                      <div key={event._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-lg font-semibold text-slate-900">{event.title}</p>
                        {event.description ? <p className="mt-1 text-sm text-slate-600">{event.description}</p> : null}
                        <p className="mt-1 text-sm text-slate-600">{event.location || "Location to be confirmed"}</p>
                        <p className="mt-1 text-sm text-slate-600">{formatDate(event.eventDate)}</p>
                        <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
                          {event.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                    No event assignments yet.
                  </p>
                )}
              </div>

              <div>
                <h2 className="mb-4 text-xl font-bold text-slate-900">Tracking History</h2>
                {trackingHistory.length ? (
                  <div className="space-y-4">
                    {trackingHistory.map((item) => (
                      <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="text-lg font-semibold text-slate-900">{item.activityId?.title || "Activity record"}</p>
                        <p className="mt-1 text-sm text-slate-600 capitalize">
                          Status: {item.participationStatus}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">Hours Completed: {item.hoursCompleted}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.remarks || "No remarks added."}</p>
                        <p className="mt-2 text-xs uppercase tracking-wide text-slate-500">{formatDate(item.updatedAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                    No official tracking history yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default VolunteerActivities;
