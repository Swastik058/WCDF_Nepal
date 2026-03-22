import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { getVolunteerProfile, updateVolunteerProfile } from "../services/volunteerService";

function VolunteerProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getVolunteerProfile();
        setProfile(response);
        setForm({
          fullName: response.fullName || "",
          phone: response.phone || "",
          address: response.address || "",
          skills: response.skills?.join(", ") || "",
          availability: response.availability || "",
          reasonForJoining: response.reasonForJoining || "",
          previousExperience: response.previousExperience || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load volunteer profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setSaving(true);
      const response = await updateVolunteerProfile(form);
      setProfile(response.profile);
      setForm({
        fullName: response.profile.fullName || "",
        phone: response.profile.phone || "",
        address: response.profile.address || "",
        skills: response.profile.skills?.join(", ") || "",
        availability: response.profile.availability || "",
        reasonForJoining: response.profile.reasonForJoining || "",
        previousExperience: response.profile.previousExperience || "",
      });
      setMessage(response.message || "Volunteer profile updated successfully");
    } catch (err) {
      setError(err.message || "Failed to update volunteer profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-10">
        {loading ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <Loader />
            <p className="text-slate-600">Loading volunteer profile...</p>
          </div>
        ) : error && !form ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>
        ) : (
          <div className="rounded-3xl bg-white p-8 shadow">
            <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-teal-900">Volunteer Profile</h1>
                <p className="mt-2 text-slate-600">Manage your approved volunteer information.</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Status: <span className="font-semibold capitalize">{profile?.status}</span>
              </div>
            </div>

            {message ? <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
            {error ? <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              {["fullName", "phone", "address", "skills", "availability"].map((field) => (
                <label key={field} className={`block text-sm ${field === "address" ? "md:col-span-2" : ""}`}>
                  <span className="mb-2 block font-medium capitalize text-slate-700">
                    {field === "fullName" ? "Full Name" : field}
                  </span>
                  <input
                    name={field}
                    value={form?.[field] || ""}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                  />
                </label>
              ))}

              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block font-medium text-slate-700">Reason For Joining</span>
                <textarea
                  name="reasonForJoining"
                  value={form?.reasonForJoining || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="block text-sm md:col-span-2">
                <span className="mb-2 block font-medium text-slate-700">Previous Experience</span>
                <textarea
                  name="previousExperience"
                  value={form?.previousExperience || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
                />
              </label>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Saving..." : "Save Volunteer Profile"}
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

export default VolunteerProfile;
