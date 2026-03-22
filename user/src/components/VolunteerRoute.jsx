import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Loader from "./Loader";
import VolunteerStatusPanel from "./VolunteerStatusPanel";
import { getVolunteerStatus } from "../services/volunteerService";

function VolunteerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusData, setStatusData] = useState(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setLoading(true);
        const data = await getVolunteerStatus();
        setStatusData(data);
      } catch (err) {
        setError(err.message || "Failed to verify volunteer access");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <Loader />
          <p className="text-slate-600">Checking volunteer access...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-rose-700">Volunteer access check failed</h1>
            <p className="mt-3 text-sm text-rose-600">{error}</p>
            <Link
              to="/dashboard"
              className="mt-4 inline-flex rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!statusData?.isVolunteer || statusData?.status !== "approved") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-12">
          <VolunteerStatusPanel statusData={statusData} />
        </div>
        <Footer />
      </div>
    );
  }

  return children;
}

export default VolunteerRoute;
