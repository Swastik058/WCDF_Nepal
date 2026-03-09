import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";
import Navbar from "../components/Navbar";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      setSuccess(response.message || "Password reset link sent.");
    } catch (err) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Forgot Password</h2>
          <p className="mt-1 text-sm text-slate-600">Enter your email to receive a reset link.</p>

          {error && <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          {success && <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-800">Email</label>
              <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your account email" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Remembered your password? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;