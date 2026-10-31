import React, { useState, useEffect } from "react";
import { getAllOfficials, verifyOfficial } from "../../Api/userApi";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import { ShieldCheck, Mail, Building2 } from "lucide-react";

const getErrMsg = (err) =>
  err?.response?.data?.error?.message || err?.message || "Something went wrong";

const VerifyOfficials = () => {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAllOfficials({ isVerified: "false" });
        if (res.success && Array.isArray(res.data)) {
          setOfficials(res.data.filter((o) => !o.isVerified));
        }
      } catch (err) {
        setErrorMsg(getErrMsg(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerify = async (id) => {
    setErrorMsg("");
    setSuccessMsg("");
    setVerifyingId(id);
    try {
      const res = await verifyOfficial(id);
      if (res.success) {
        setOfficials((prev) => prev.filter((o) => o.id !== id));
        setSuccessMsg("Official verified successfully.");
      }
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    } finally {
      setVerifyingId(null);
    }
  };

  if (loading) {
    return <Loader fullScreen message="Loading pending officials..." />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Verify Pending Officials
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Review official credentials and authorize municipal department access.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs px-4 py-3">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs px-4 py-3">
            {successMsg}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
          {officials.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No pending official verification requests in the queue.
            </div>
          ) : (
            officials.map((o) => (
              <div
                key={o.id}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                    <ShieldCheck size={16} className="text-teal-600" />
                    {o.user?.name || "Official"}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail size={12} />
                      {o.user?.email || "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building2 size={12} />
                      {o.department} / {o.designation}
                    </span>
                    <span>ID: {o.employeeId}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleVerify(o.id)}
                  disabled={verifyingId === o.id}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-semibold text-xs rounded-2xl"
                >
                  {verifyingId === o.id ? "Verifying..." : "Approve & Verify"}
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default VerifyOfficials;