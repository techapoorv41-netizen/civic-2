import React, { useState, useEffect } from "react";
import { getIssues, verifyIssue, deleteIssue } from "../../Api/issueApi";
import Sidebar from "../../components/common/Sidebar";
import IssueStatusBadge from "../../components/issue/IssueStatusBadge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import { CheckCircle2, Trash2 } from "lucide-react";

const getErrMsg = (err) =>
  err?.response?.data?.error?.message || err?.message || "Something went wrong";

const VerifyIssue = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await getIssues({ status: "pending", limit: 100 });
        if (res.success && Array.isArray(res.data)) {
          setIssues(res.data);
        }
      } catch (err) {
        setErrorMsg(getErrMsg(err));
      }
      setLoading(false);
    };
    fetchPending();
  }, []);

  const handleVerify = async (issueId) => {
    setErrorMsg("");
    setBusyId(issueId);
    try {
      const res = await verifyIssue(issueId);
      if (res.success) {
        setIssues((prev) => prev.filter((i) => i.id !== issueId));
      }
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    }
    setBusyId(null);
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm("Remove this report as spam?")) return;
    setErrorMsg("");
    setBusyId(issueId);
    try {
      const res = await deleteIssue(issueId);
      if (res.success) {
        setIssues((prev) => prev.filter((i) => i.id !== issueId));
      }
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    }
    setBusyId(null);
  };

  if (loading) {
    return <Loader fullScreen message="Loading issue verification queue..." />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Verify & Moderation Queue
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Perform anti-spam verification before publishing citizen reports to public department feeds.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs px-4 py-3">
            {errorMsg}
          </div>
        )}

        {issues.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No unverified reports pending moderation.
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{issue.title}</h3>
                    <IssueStatusBadge status={issue.status} />
                  </div>
                  <p className="text-xs text-slate-500">{issue.description}</p>
                </div>

                {issue.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleVerify(issue.id)}
                      variant="primary"
                      size="sm"
                      isLoading={busyId === issue.id}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 size={14} />
                      Verify Genuine
                    </Button>
                    <Button
                      onClick={() => handleDelete(issue.id)}
                      variant="danger"
                      size="sm"
                      disabled={busyId === issue.id}
                    >
                      <Trash2 size={14} />
                      Remove Spam
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VerifyIssue;