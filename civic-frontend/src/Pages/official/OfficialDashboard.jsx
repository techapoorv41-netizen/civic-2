import { useState, useEffect } from "react";
import { getIssues, assignIssue } from "../../api/issueApi";
import { getAllUsers, blockUser, unblockUser } from "../../api/userApi";
import ReportAnalysisChart from "../../components/charts/ReportAnalysisChart";
import Modal from "../../components/common/Modal";

function AdminDashboard() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [officialId, setOfficialId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [issuesRes, usersRes] = await Promise.all([
        getIssues(),
        getAllUsers(),
      ]);
      if (issuesRes.success) setIssues(issuesRes.data);
      if (usersRes.success) setUsers(usersRes.data);
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

  const handleAssign = async () => {
    if (!officialId) return;
    const res = await assignIssue(selectedIssueId, { officialId });
    if (res.success) {
      setIssues((prev) =>
        prev.map((i) =>
          i.id === selectedIssueId ? { ...i, assignedTo: officialId } : i
        )
      );
    }
    setSelectedIssueId(null);
    setOfficialId("");
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading dashboard...</p>;
  }

  const totalIssues = issues.length;
  const totalUsers = users.length;
  const totalOfficials = users.filter((u) => u.role === "official").length;

  const categoryBreakdown = Object.values(
    issues.reduce((acc, issue) => {
      acc[issue.category] = acc[issue.category] || { category: issue.category, count: 0 };
      acc[issue.category].count += 1;
      return acc;
    }, {})
  );

  const officials = users.filter((u) => u.role === "official");

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Issues</p>
          <p className="text-2xl font-semibold text-gray-800">{totalIssues}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-semibold text-gray-800">{totalUsers}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Officials</p>
          <p className="text-2xl font-semibold text-gray-800">{totalOfficials}</p>
        </div>
      </div>

      {/* Chart */}
      <ReportAnalysisChart data={categoryBreakdown} />

      {/* Issues List with Assign action */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Issues</h3>
        <div className="space-y-2">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-3 bg-white"
            >
              <div>
                <p className="font-medium text-gray-800">{issue.title}</p>
                <p className="text-xs text-gray-500">
                  {issue.assignedTo ? "Assigned" : "Unassigned"}
                </p>
              </div>
              {!issue.assignedTo && (
                <button
                  onClick={() => setSelectedIssueId(issue.id)}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700"
                >
                  Assign
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Manage Users */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Manage Users</h3>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-3 bg-white"
            >
              <div>
                <p className="font-medium text-gray-800">{u.name}</p>
                <p className="text-xs text-gray-500">{u.role}</p>
              </div>
              <button
                onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  u.isBlocked
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {u.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Modal */}
      {selectedIssueId && (
        <Modal onClose={() => setSelectedIssueId(null)}>
          <h3 className="font-semibold text-gray-800 mb-3">Assign Issue</h3>
          <select
            value={officialId}
            onChange={(e) => setOfficialId(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3"
          >
            <option value="">Select official</option>
            {officials.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setSelectedIssueId(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Assign
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminDashboard;