import React, { useState, useEffect } from "react";
import { getMyAssignments, acceptAssignment, completeAssignment, rejectAssignment, updateIssue } from "../../api/issueApi";
import Sidebar from "../../components/common/Sidebar";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import IssueStatusBadge from "../../components/issue/IssueStatusBadge";
import Loader from "../../components/common/Loader";
import { Check, X, CheckCircle2, MessageSquare } from "lucide-react";

const HandleReports = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [actionType, setActionType] = useState(null); // 'complete' | 'reject'
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      const res = await getMyAssignments();
      if (res.success && Array.isArray(res.data)) {
        setAssignments(res.data);
      }
      setLoading(false);
    };
    fetchAssignments();
  }, []);

  const handleAccept = async (id) => {
    const res = await acceptAssignment(id);
    if (res.success) {
      setAssignments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "in_progress" } : item))
      );
    }
  };

  const handleOpenActionModal = (issue, type) => {
    setSelectedIssue(issue);
    setActionType(type);
    setRemarks("");
  };

  const handleConfirmAction = async () => {
    if (!selectedIssue || !actionType) return;
    setSubmitting(true);

    try {
      if (actionType === "complete") {
        await completeAssignment(selectedIssue.id, { remarks });
        await updateIssue(selectedIssue.id, { status: "resolved" });
        setAssignments((prev) =>
          prev.map((i) => (i.id === selectedIssue.id ? { ...i, status: "resolved" } : i))
        );
      } else if (actionType === "reject") {
        await rejectAssignment(selectedIssue.id, { remarks });
        await updateIssue(selectedIssue.id, { status: "rejected" });
        setAssignments((prev) =>
          prev.map((i) => (i.id === selectedIssue.id ? { ...i, status: "rejected" } : i))
        );
      }
    } finally {
      setSubmitting(false);
      setSelectedIssue(null);
      setActionType(null);
    }
  };

  if (loading) {
    return <Loader fullScreen message="Loading assignment queue..." />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Handle Assigned Reports
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Accept pending assignments, update repair progress, or complete reports with inspection remarks.
          </p>
        </div>

        {assignments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No active assignments requiring action.
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((issue) => (
              <div
                key={issue.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                      {issue.category}
                    </span>
                    <IssueStatusBadge status={issue.status} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{issue.title}</h3>
                  <p className="text-xs text-slate-500">{issue.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {issue.status === "pending" && (
                    <Button onClick={() => handleAccept(issue.id)} variant="primary" size="sm">
                      <Check size={14} />
                      Accept Assignment
                    </Button>
                  )}

                  {issue.status === "in_progress" && (
                    <>
                      <Button
                        onClick={() => handleOpenActionModal(issue, "complete")}
                        variant="primary"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={14} />
                        Mark Resolved
                      </Button>
                      <Button
                        onClick={() => handleOpenActionModal(issue, "reject")}
                        variant="danger"
                        size="sm"
                      >
                        <X size={14} />
                        Reject Report
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Confirmation Modal */}
        {selectedIssue && (
          <Modal
            isOpen={!!selectedIssue}
            onClose={() => setSelectedIssue(null)}
            title={actionType === "complete" ? "Complete & Mark Resolved" : "Reject Assignment"}
          >
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Action for: <strong>{selectedIssue.title}</strong>
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Inspection Remarks & Repair Notes
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter official remarks or completion status notes..."
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedIssue(null)}>
                  Cancel
                </Button>
                <Button
                  variant={actionType === "complete" ? "primary" : "danger"}
                  size="sm"
                  onClick={handleConfirmAction}
                  isLoading={submitting}
                >
                  Confirm Action
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
};

export default HandleReports;
