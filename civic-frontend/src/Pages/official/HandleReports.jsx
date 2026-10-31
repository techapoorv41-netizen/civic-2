import React, { useState, useEffect } from "react";
import { getMyAssignments, acceptAssignment, completeAssignment, rejectAssignment } from "../../Api/issueApi";
import Sidebar from "../../components/common/Sidebar";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import IssueStatusBadge from "../../components/issue/IssueStatusBadge";
import Loader from "../../components/common/Loader";
import { Check, X, CheckCircle2 } from "lucide-react";

const getErrMsg = (err) =>
  err?.response?.data?.error?.message || err?.message || "Something went wrong";

const HandleReports = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionType, setActionType] = useState(null); // 'complete' | 'reject'
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await getMyAssignments();
        if (res.success && Array.isArray(res.data)) {
          setAssignments(res.data);
        }
      } catch (err) {
        setErrorMsg(getErrMsg(err));
      }
      setLoading(false);
    };
    fetchAssignments();
  }, []);

  const updateStatus = (id, status) => {
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const handleAccept = async (id) => {
    setErrorMsg("");
    try {
      const res = await acceptAssignment(id);
      if (res.success) updateStatus(id, "accepted");
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    }
  };

  const openModal = (assignment, type) => {
    setErrorMsg("");
    setSelected(assignment);
    setActionType(type);
    setText("");
  };

  const closeModal = () => {
    setSelected(null);
    setActionType(null);
    setText("");
  };

  const handleConfirm = async () => {
    if (!selected || !actionType) return;
    const value = text.trim();

    if (actionType === "complete" && value.length < 5) {
      setErrorMsg("Remarks kam se kam 5 akshar ke hone chahiye.");
      return;
    }
    if (actionType === "reject" && !value) {
      setErrorMsg("Reject karne ka reason likhna zaroori hai.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      if (actionType === "complete") {
        const res = await completeAssignment(selected.id, { remarks: value });
        if (res.success) updateStatus(selected.id, "completed");
      } else {
        const res = await rejectAssignment(selected.id, { reason: value });
        if (res.success) updateStatus(selected.id, "rejected");
      }
      closeModal();
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    }
    setSubmitting(false);
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

        {errorMsg && !selected && (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs px-4 py-3">
            {errorMsg}
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No active assignments requiring action.
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => (
              <div
                key={a.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {a.issue?.priority && (
                      <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                        {a.issue.priority}
                      </span>
                    )}
                    <IssueStatusBadge status={a.status} />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {a.issue?.title || "Untitled issue"}
                  </h3>
                  {a.remarks && <p className="text-xs text-slate-500">Admin note: {a.remarks}</p>}
                  {a.dueDate && (
                    <p className="text-xs text-slate-500">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {a.status === "assigned" && (
                    <>
                      <Button onClick={() => handleAccept(a.id)} variant="primary" size="sm">
                        <Check size={14} />
                        Accept Assignment
                      </Button>
                      <Button onClick={() => openModal(a, "reject")} variant="danger" size="sm">
                        <X size={14} />
                        Reject
                      </Button>
                    </>
                  )}

                  {a.status === "accepted" && (
                    <Button
                      onClick={() => openModal(a, "complete")}
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 size={14} />
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <Modal
            isOpen={!!selected}
            onClose={closeModal}
            title={actionType === "complete" ? "Complete & Mark Resolved" : "Reject Assignment"}
          >
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Action for: <strong>{selected.issue?.title}</strong>
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {actionType === "complete"
                    ? "Inspection Remarks & Repair Notes (min 5 characters)"
                    : "Reason for rejecting"}
                </label>
                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={
                    actionType === "complete"
                      ? "Enter completion remarks..."
                      : "Enter the reason..."
                  }
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={actionType === "complete" ? "primary" : "danger"}
                  size="sm"
                  onClick={handleConfirm}
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