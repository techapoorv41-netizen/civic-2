import React, { useState, useEffect } from "react";
import { getIssues, assignIssue } from "../../Api/issueApi";
import { getAllUsers, blockUser, unblockUser, getAllOfficials } from "../../Api/userApi";
import Sidebar from "../../components/common/Sidebar";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import ReportAnalysisChart from "../../components/charts/ReportAnalysisChart";
import Loader from "../../components/common/Loader";
import IssueStatusBadge from "../../components/issue/IssueStatusBadge";
import { Users, FileText, ShieldAlert, UserX, UserCheck, UserPlus } from "lucide-react";

const getCategoryName = (issue) => {
  const c = issue.category;
  if (!c) return "Other";
  if (typeof c === "string") return c;
  return c.name || "Other";
};

const getAssignedId = (issue) =>
  issue.assignedOfficialId || issue.assignedOfficial?.id || issue.assignedTo || null;

const getErrMsg = (err) =>
  err?.response?.data?.error?.message || err?.message || "Something went wrong";

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedOfficialId, setSelectedOfficialId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issuesRes, usersRes, officialsRes] = await Promise.all([
          getIssues(),
          getAllUsers(),
          getAllOfficials(),
        ]);

        if (issuesRes.success && Array.isArray(issuesRes.data)) setIssues(issuesRes.data);
        if (usersRes.success && Array.isArray(usersRes.data)) setUsers(usersRes.data);
        if (officialsRes.success && Array.isArray(officialsRes.data)) setOfficials(officialsRes.data);
      } catch (err) {
        setErrorMsg(getErrMsg(err));
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleUnblock = async (userId) => {
    setErrorMsg("");
    try {
      const res = await unblockUser(userId);
      if (res.success) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isBlocked: false } : u)));
      }
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    }
  };

  const openBlockModal = (user) => {
    setErrorMsg("");
    setBlockReason("");
    setBlockTarget(user);
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    if (!blockTarget || !blockReason.trim()) return;

    setBlocking(true);
    setErrorMsg("");
    try {
      const res = await blockUser(blockTarget.id, { reason: blockReason.trim() });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === blockTarget.id ? { ...u, isBlocked: true } : u))
        );
        setBlockTarget(null);
        setBlockReason("");
      }
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    }
    setBlocking(false);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssueId || !selectedOfficialId) return;

    setAssigning(true);
    setErrorMsg("");
    try {
      const res = await assignIssue(selectedIssueId, { officialId: selectedOfficialId });
      if (res.success) {
        setIssues((prev) =>
          prev.map((i) =>
            i.id === selectedIssueId ? { ...i, assignedOfficialId: selectedOfficialId } : i
          )
        );
        setSelectedIssueId(null);
        setSelectedOfficialId("");
      }
    } catch (err) {
      setErrorMsg(getErrMsg(err));
    }
    setAssigning(false);
  };

  const categoryCounts = issues.reduce((acc, issue) => {
    const name = getCategoryName(issue);
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }));

  if (loading) {
    return <Loader fullScreen message="Loading Admin Master Console..." />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            System Administration Console
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Global system overview, user permissions management, and task dispatching.
          </p>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs px-4 py-3">
            {errorMsg}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Registered Users</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{users.length}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Total Issues</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{issues.length}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department Officials</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{officials.length}</h3>
            </div>
          </div>
        </div>

        {/* Analytics Chart */}
        <ReportAnalysisChart data={chartData} />

        {/* Issue Assignment Dispatch Queue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Issue Assignment Dispatch</h2>
          <div className="space-y-3">
            {issues.map((issue) => {
              const assignedId = getAssignedId(issue);
              const assignedOfficial = officials.find((o) => o.userId === assignedId);
              const canAssign = issue.status === "verified" && !assignedId;
              return (
                <div
                  key={issue.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{issue.title}</span>
                      <IssueStatusBadge status={issue.status} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {assignedId
                        ? `Assigned to: ${assignedOfficial?.user?.name || issue.assignedOfficial?.name || "Official"}`
                        : "Status: Unassigned"}
                    </p>
                  </div>

                  {canAssign && (
                    <Button
                      onClick={() => {
                        setErrorMsg("");
                        setSelectedOfficialId("");
                        setSelectedIssueId(issue.id);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <UserPlus size={14} />
                      Assign Official
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Manage User Permissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">User Governance & Access Control</h2>
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{u.name}</h4>
                  <p className="text-[11px] text-slate-500">{u.email} • Role: <span className="capitalize font-semibold">{u.role}</span></p>
                </div>

                {u.role !== "admin" && (
                  <Button
                    onClick={() => (u.isBlocked ? handleUnblock(u.id) : openBlockModal(u))}
                    variant={u.isBlocked ? "primary" : "danger"}
                    size="sm"
                  >
                    {u.isBlocked ? <UserCheck size={14} /> : <UserX size={14} />}
                    {u.isBlocked ? "Unblock User" : "Block User"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Assign Modal */}
        {selectedIssueId && (
          <Modal
            isOpen={!!selectedIssueId}
            onClose={() => setSelectedIssueId(null)}
            title="Assign Official to Issue Ticket"
          >
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Department Official
                </label>
                <select
                  value={selectedOfficialId}
                  onChange={(e) => setSelectedOfficialId(e.target.value)}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  required
                >
                  <option value="">Select an Official...</option>
                  {officials.map((o) => (
                    <option key={o.id} value={o.userId}>
                      {o.user?.name || "Official"}
                    </option>
                  ))}
                </select>
              </div>

              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedIssueId(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={assigning}>
                  Confirm Assignment
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Block Modal */}
        {blockTarget && (
          <Modal
            isOpen={!!blockTarget}
            onClose={() => setBlockTarget(null)}
            title={`Block ${blockTarget.name}`}
          >
            <form onSubmit={handleBlockSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for blocking
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  placeholder="Write the reason here..."
                  required
                />
              </div>

              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setBlockTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm" isLoading={blocking}>
                  Confirm Block
                </Button>
              </div>
            </form>
          </Modal>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;