import { Link } from "react-router-dom";

const statusStyles = {
  not_applied: {
    badge: "bg-slate-100 text-slate-700",
    card: "border-slate-200 bg-white",
    title: "Volunteer application not started",
    description: "You are logged in as a normal user. Submit a volunteer application to request access.",
  },
  pending: {
    badge: "bg-amber-100 text-amber-700",
    card: "border-amber-200 bg-amber-50",
    title: "Volunteer application pending",
    description: "Your application has been submitted and is waiting for admin review.",
  },
  approved: {
    badge: "bg-emerald-100 text-emerald-700",
    card: "border-emerald-200 bg-emerald-50",
    title: "Volunteer access approved",
    description: "Your volunteer account is active. You can now access the volunteer dashboard and features.",
  },
  rejected: {
    badge: "bg-rose-100 text-rose-700",
    card: "border-rose-200 bg-rose-50",
    title: "Volunteer application rejected",
    description: "Your volunteer request was reviewed and not approved.",
  },
};

function VolunteerStatusPanel({ statusData, compact = false }) {
  const status = statusData?.status || "not_applied";
  const config = statusStyles[status] || statusStyles.not_applied;

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${config.card}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ${config.badge}`}>
            {status.replace("_", " ")}
          </span>
          <h2 className="mt-3 text-xl font-bold text-slate-900">{config.title}</h2>
          <p className="mt-2 text-sm text-slate-700">{config.description}</p>

          {status === "rejected" && statusData?.rejectionReason ? (
            <p className="mt-3 text-sm font-medium text-rose-700">Rejection reason: {statusData.rejectionReason}</p>
          ) : null}

          {statusData?.adminRemarks ? (
            <p className="mt-2 text-sm text-slate-700">Admin remarks: {statusData.adminRemarks}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          {status === "not_applied" ? (
            <Link
              to="/volunteer/apply"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Become a Volunteer
            </Link>
          ) : null}

          {status === "approved" ? (
            <Link
              to="/volunteer/dashboard"
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              Open Volunteer Dashboard
            </Link>
          ) : null}

          {!compact ? (
            <Link
              to="/dashboard"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Back to Dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default VolunteerStatusPanel;
