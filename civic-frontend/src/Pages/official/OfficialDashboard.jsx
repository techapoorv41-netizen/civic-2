import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getIssues, getMyAssignments } from "../../api/issueApi";
import Sidebar from "../../components/common/Sidebar";
import IssueCard from "../../components/issue/IssueCard";
import Loader from "../../components/common/Loader";
import { ROUTES, ISSUE_STATUS } from "../../utils/constants";
import { CheckSquare, AlertCircle, Clock, ShieldCheck, ArrowRight } from "lucide-react";

const OfficialDashboard = () => {
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getMyAssignments();
      if (res.success && Array.isArray(res.data)) {
        setAssignedIssues(res.data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalAssigned = assignedIssues.length;
  const pendingActions = assignedIssues.filter(
    (i) => i.status === ISSUE_STATUS.PENDING || i.status === ISSUE_STATUS.IN_PROGRESS
  ).length;

  if (loading) {
    return <Loader fullScreen message="Loading Official Portal..." />;
  }

  return (
    <div className="flex min-h-screen bg-govLight">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-govNavy tracking-tight">
              Official Task Dashboard
            </h1>
            <p className="text-xs text-govText mt-1">
              Manage assigned municipal tickets, accept/reject reports, and submit status updates.
            </p>
          </div>

          <Link to={ROUTES.OFFICIAL_HANDLE_REPORTS}>
            <button className="px-5 py-2.5 bg-govOrange hover:bg-govOrange/90 text-white font-bold text-xs rounded-2xl shadow-lg shadow-govOrange/20 transition-all flex items-center gap-2 cursor-pointer">
              <CheckSquare size={16} />
              Handle Pending Reports
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-govLight text-govNavy flex items-center justify-center shrink-0">
              <CheckSquare size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-govText/70 uppercase tracking-wider">My Total Assignments</p>
              <h3 className="text-3xl font-extrabold text-govNavy">{totalAssigned}</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-govText/70 uppercase tracking-wider">Pending Action Required</p>
              <h3 className="text-3xl font-extrabold text-govNavy">{pendingActions}</h3>
            </div>
          </div>
        </div>

        {/* Assigned Issues List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-govNavy">Assigned Issues Queue</h2>
            <Link to={ROUTES.OFFICIAL_ALL_ISSUES} className="text-xs font-semibold text-govSlate hover:text-govOrange hover:underline">
              View All Department Issues &rarr;
            </Link>
          </div>

          {assignedIssues.length === 0 ? (
            <div className="p-8 text-center text-xs text-govText bg-white rounded-3xl border border-slate-200">
              No assigned tasks pending in your department queue.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default OfficialDashboard;