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
    <div className="flex min-h-screen bg-govLight">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-govNavy tracking-tight">
            Verify Pending Officials
          </h1>
          <p className="text-xs text-govText mt-1">
            Review official credentials and authorize municipal department access.
          </p>
        </div>

        {officials.length === 0 ? (
          <div className="p-12 text-center text-xs text-govText bg-white rounded-3xl border border-slate-200">
            No pending official verification requests in the queue.
          </div>
        ) : (
          <div className="space-y-3">
            {officials.map((official) => (
              <div
                key={official.id}
                className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-govNavy flex items-center gap-2">
                    <ShieldCheck size={16} className="text-govSlate" />
                    {official.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-govText/70">
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-govSlate" /> {official.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building size={12} className="text-govSlate" /> {official.department || "Public Works"}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleVerify(official.id)}
                  variant="primary"
                  size="sm"
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