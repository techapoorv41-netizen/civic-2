import React, { useState, useEffect } from "react";
import { getAllOfficials, verifyOfficial } from "../../api/userApi";
import Sidebar from "../../components/common/Sidebar";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import { ShieldCheck, Mail, Building } from "lucide-react";

const VerifyOfficials = () => {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      const res = await getAllOfficials({ isVerified: false });
      if (res.success && Array.isArray(res.data)) {
        setOfficials(res.data);
      }
      setLoading(false);
    };
    fetchPending();
  }, []);

  const handleVerify = async (officialId) => {
    const res = await verifyOfficial(officialId);
    if (res.success) {
      setOfficials((prev) => prev.filter((o) => o.id !== officialId));
    }
  };

  if (loading) {
    return <Loader fullScreen message="Fetching pending official verification queue..." />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Verify Pending Officials
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Review official credentials and authorize municipal department access.
          </p>
        </div>

        {officials.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No pending official verification requests in the queue.
          </div>
        ) : (
          <div className="space-y-3">
            {officials.map((official) => (
              <div
                key={official.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-teal-600" />
                    {official.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {official.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building size={12} /> {official.department || "Public Works"}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleVerify(official.id)}
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Approve & Verify Official
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VerifyOfficials;