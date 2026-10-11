import React, { useState, useEffect } from "react";
import { getIssues, assignIssue } from "../../api/issueApi";
import { getAllUsers, blockUser, unblockUser, getAllOfficials } from "../../api/userApi";
import Sidebar from "../../components/common/Sidebar";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import ReportAnalysisChart from "../../components/charts/ReportAnalysisChart";
import Loader from "../../components/common/Loader";
import IssueStatusBadge from "../../components/issue/IssueStatusBadge";
import { Users, FileText, ShieldAlert, UserX, UserCheck, UserPlus } from "lucide-react";

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedOfficialId, setSelectedOfficialId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [issuesRes, usersRes, officialsRes] = await Promise.all([
        getIssues(),
        getAllUsers(),
        getAllOfficials(),
      ]);

      if (issuesRes.success && Array.isArray(issuesRes.data)) setIssues(issuesRes.data);
      if (usersRes.success && Array.isArray(usersRes.data)) setUsers(usersRes.data);
      if (officialsRes.success && Array.isArray(officialsRes.data)) setOfficials(officialsRes.data);

      setLoading(false);
    };

    fetchData();
  }, []);

  const handleToggleBlock = async (userId, isBlocked) => {
    const res = isBlocked ? await unblockUser(userId) : await blockUser(userId);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBlocked: !isBlocked } : u))
      );
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIssueId || !selectedOfficialId) return;

    setAssigning(true);
    const res = await assignIssue(selectedIssueId, { officialId: selectedOfficialId });
    if (res.success) {
      setIssues((prev) =>
        prev.map((i) => (i.id === selectedIssueId ? { ...i, assignedTo: selectedOfficialId } : i))
      );
      setSelectedIssueId(null);
      setSelectedOfficialId("");
    }
    setAssigning(false);
  };

  const chartData = [
    { category: "Roads", count: issues.filter((i) => i.category?.includes("Road")).length || 12 },
    { category: "Lighting", count: issues.filter((i) => i.category?.includes("Light")).length || 8 },
    { category: "Sanitation", count: issues.filter((i) => i.category?.includes("Sanitat")).length || 15 },
    { category: "Water", count: issues.filter((i) => i.category?.includes("Water")).length || 6 },
  ];

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
            {issues.map((issue) => (
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
                    {issue.assignedTo ? `Assigned to: Official #${issue.assignedTo}` : "Status: Unassigned"}
                  </p>
                </div>

                <Button
                  onClick={() => setSelectedIssueId(issue.id)}
                  variant="outline"
                  size="sm"
                >
                  <UserPlus size={14} />
                  {issue.assignedTo ? "Reassign Official" : "Assign Official"}
                </Button>
              </div>
            ))}
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

                <Button
                  onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                  variant={u.isBlocked ? "primary" : "danger"}
                  size="sm"
                >
                  {u.isBlocked ? <UserCheck size={14} /> : <UserX size={14} />}
                  {u.isBlocked ? "Unblock User" : "Block User"}
                </Button>
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
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.department || "Public Works"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedIssueId(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={assigning}>
                  Confirm Assignment
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
