import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
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

  const volunteerName = data?.volunteer?.fullName || "Volunteer";
  const totalHours = data?.summary?.volunteerHours || 0;
  const hasCertificate = totalHours >= 10;
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const downloadVolunteerCertificate = async () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Define positions in cm and convert to pt (1 cm ≈ 28.35 pt)
    const nameX = 14.8 * 28.35;
    const nameY = 10.7 * 28.35;
    const hoursX = 14 * 28.35;
    const hoursY = 13.3 * 28.35;
    const dateX = 6.51 * 28.35;
    const dateY = 17.8 * 28.35;

    try {
      // Load the certificate background image from public folder
      const img = new Image();
      img.src = '/certificate.png';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Add image as full background
      doc.addImage(img, 'PNG', 0, 0, pageWidth, pageHeight);

      // Overlay volunteer name - centered around position
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(volunteerName, nameX, nameY, { align: "center", maxWidth: pageWidth - 100 });

      // Overlay total hours - left-aligned at position
      doc.setFontSize(20);
      doc.setFont("helvetica", "normal");
      doc.text(`${totalHours}`, hoursX, hoursY);

      // Overlay issue date - left-aligned at position
      doc.setFontSize(13);
      doc.text(`Issue Date: ${issueDate}`, dateX, dateY);

      // Save with dynamic filename
      doc.save(`WCDF-Certificate-${volunteerName.replace(/\s+/g, "-")}.pdf`);
    } catch (error) {
      console.error("Error loading certificate background image:", error);
      alert("Failed to load certificate template. Please try again.");
    }
  };

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

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-teal-900">Volunteer Certificate (Please Bring this certificate to officially verify)</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {hasCertificate
                      ? "You have completed 10 or more volunteer hours. Download your volunteer completion certificate below."
                      : "Complete 10 approved volunteer hours to unlock your PDF certificate."
                    }
                  </p>
                </div>
                <button
                  onClick={downloadVolunteerCertificate}
                  disabled={!hasCertificate}
                  className={`rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${hasCertificate ? "bg-teal-700 hover:bg-teal-800" : "bg-slate-300 text-slate-700 cursor-not-allowed"}`}
                >
                  Download Volunteer Certificate
                </button>
              </div>

              <div className="mt-6 rounded-3xl border border-teal-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-700">WCDF Nepal</p>
                    <h2 className="text-2xl font-bold text-teal-900">Certificate Preview</h2>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${hasCertificate ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {hasCertificate ? "Ready to Download" : "Locked until 10 hours"}
                  </span>
                </div>

                {/* <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Certificate of Volunteer Achievement</p>
                  <h3 className="mt-4 text-2xl font-semibold text-teal-900">Presented to</h3>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{volunteerName}</p>
                  <p className="mt-4 text-sm text-slate-600">
                    For completing <span className="font-semibold text-teal-900">{totalHours}</span> approved volunteer hours with WCDF Nepal.
                  </p>
                  <p className="mt-4 text-sm text-slate-500">Date Issued: {issueDate}</p>
                </div> */}
                  <div className="mt-6 flex justify-center">
  <div
    id="certificate-preview"
    className="relative w-[1000px] h-[700px] bg-contain bg-no-repeat bg-center shadow-lg"
    style={{ backgroundImage: "url('/certificate.png')" }}
  >

    {/* NAME (Your name here) */}
    <div className="absolute w-full text-center top-[49%] -translate-y-1/2">
      <p className="text-4xl font-bold text-black">
        {volunteerName}
      </p>
    </div>

    {/* HOURS ([Total Hours]) */}
    <div className="absolute w-full text-center top-[56%]">
      <p className="text-lg text-black">
        {totalHours} 
      </p>
    </div>

    {/* DATE ([Date]) */}
    <div className="absolute left-[18%] bottom-[26%]">
      <p className="text-sm text-black">
        {issueDate}
      </p>
    </div>

  </div>
</div>
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
