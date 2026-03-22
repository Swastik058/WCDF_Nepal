import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VolunteerStatusPanel from "../components/VolunteerStatusPanel";
import { useAuth } from "../context/AuthContext";
import { applyForVolunteer, getVolunteerStatus } from "../services/volunteerService";

const initialForm = {
  fullName: "",
  phone: "",
  address: "",
  skills: "",
  availability: "",
  reasonForJoining: "",
  previousExperience: "",
};

function VolunteerApply() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await getVolunteerStatus();
        setStatusData(data);

        setForm((current) => ({
          ...current,
          fullName: data?.application?.fullName || user?.name || "",
          phone: data?.application?.phone || "",
          address: data?.application?.address || "",
          skills: data?.application?.skills?.join(", ") || "",
          availability: data?.application?.availability || "",
          reasonForJoining: data?.application?.reasonForJoining || "",
          previousExperience: data?.application?.previousExperience || "",
        }));
      } catch (err) {
        setServerError(err.message || "Failed to load volunteer status");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [user]);

  const validateForm = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!form.phone.trim()) nextErrors.phone = "Phone number is required";
    if (!form.address.trim()) nextErrors.address = "Address is required";
    if (!form.availability.trim()) nextErrors.availability = "Availability is required";
    if (!form.reasonForJoining.trim()) nextErrors.reasonForJoining = "Reason for joining is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    setMessage("");

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const response = await applyForVolunteer(form);
      setStatusData(response);
      setMessage("Volunteer application submitted successfully. Admin review is pending.");
      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setServerError(err.message || "Failed to submit volunteer application");
    } finally {
      setSubmitting(false);
    }
  };

  const alreadyApplied = statusData?.hasApplied && statusData?.status !== "not_applied";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 rounded-3xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-teal-900">Volunteer Registration</h1>
          <p className="mt-2 text-slate-600">
            Apply using your existing user account. Your application will stay pending until an admin approves it.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-slate-600">Loading volunteer application status...</p>
          </div>
        ) : alreadyApplied ? (
          <VolunteerStatusPanel statusData={statusData} />
        ) : (
          <div className="rounded-3xl bg-white p-8 shadow">
            <div className="mb-6 grid gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-slate-700 md:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-900">Logged in user</p>
                <p className="mt-1">{user?.name}</p>
                <p>{user?.email}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Application flow</p>
                <p className="mt-1">Submit form -> admin review -> approve or reject -> volunteer access</p>
              </div>
            </div>

            {message ? (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}

            {serverError ? (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {serverError}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-2 block font-medium text-slate-700">Full Name</span>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
                {errors.fullName ? <span className="mt-1 block text-rose-600">{errors.fullName}</span> : null}
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-slate-700">Phone</span>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
                {errors.phone ? <span className="mt-1 block text-rose-600">{errors.phone}</span> : null}
              </label>

              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block font-medium text-slate-700">Address</span>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
                {errors.address ? <span className="mt-1 block text-rose-600">{errors.address}</span> : null}
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-slate-700">Skills</span>
                <input
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="Teaching, event support, counseling"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-2 block font-medium text-slate-700">Availability</span>
                <input
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  placeholder="Weekends, evenings, 10 hrs/week"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
                {errors.availability ? <span className="mt-1 block text-rose-600">{errors.availability}</span> : null}
              </label>

              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block font-medium text-slate-700">Reason For Joining</span>
                <textarea
                  name="reasonForJoining"
                  value={form.reasonForJoining}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
                {errors.reasonForJoining ? (
                  <span className="mt-1 block text-rose-600">{errors.reasonForJoining}</span>
                ) : null}
              </label>

              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block font-medium text-slate-700">Previous Experience</span>
                <textarea
                  name="previousExperience"
                  value={form.previousExperience}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Submitting..." : "Submit Volunteer Application"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default VolunteerApply;
