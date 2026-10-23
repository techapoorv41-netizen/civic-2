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
        try {
          await updateIssue(selectedIssue.id, { status: "resolved" });
        } catch {
          // Status already set to resolved by completeAssignment
        }
        setAssignments((prev) =>
          prev.map((i) => (i.id === selectedIssue.id ? { ...i, status: "resolved" } : i))
        );
      } else if (actionType === "reject") {
        await rejectAssignment(selectedIssue.id, { remarks });
        try {
          await updateIssue(selectedIssue.id, { status: "rejected" });
        } catch {
          // Status already set to rejected by rejectAssignment
        }
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
    <div className="flex min-h-screen bg-govLight">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-govNavy tracking-tight">
            Handle Assigned Reports
          </h1>
          <p className="text-xs text-govText mt-1">
            Accept pending assignments, update repair progress, or complete reports with inspection remarks.
          </p>
        </div>

        {assignments.length === 0 ? (
          <div className="p-12 text-center text-xs text-govText bg-white rounded-3xl border border-slate-200">
            No active assignments requiring action.
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((issue) => (
              <div
                key={issue.id}
                className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-govNavy uppercase bg-govLight px-2 py-0.5 rounded border border-govSlate/20">
                      {issue.category}
                    </span>
                    <IssueStatusBadge status={issue.status} />
                  </div>
                  <h3 className="font-bold text-base text-govNavy">{issue.title}</h3>
                  <p className="text-xs text-govText">{issue.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(issue.status === "pending" || issue.status === "assigned") && (
                    <Button onClick={() => handleAccept(issue.id)} variant="primary" size="sm">
                      <Check size={14} />
                      Accept Assignment
                    </Button>
                  )}

                  {(issue.status === "in_progress" || issue.status === "accepted") && (
                    <>
                      <Button
                        onClick={() => handleOpenActionModal(issue, "complete")}
                        variant="secondary"
                        size="sm"
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
              <p className="text-xs text-govText">
                Action for: <strong className="text-govNavy">{selectedIssue.title}</strong>
              </p>

              <div>
                <label className="text-xs font-semibold text-govText block mb-1">
                  Inspection Remarks & Repair Notes
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter official remarks or completion status notes..."
                  className="w-full rounded-2xl bg-govLight border border-slate-300 p-3 text-xs text-govText focus:outline-none focus:ring-2 focus:ring-govSlate/20 focus:border-govSlate"
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
