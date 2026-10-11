import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getIssues } from "../../api/issueApi";
import IssueCard from "../../components/issue/IssueCard";
import Loader from "../../components/common/Loader";
import { ROUTES, ISSUE_STATUS } from "../../utils/constants";
import { FileText, Clock, CheckCircle2, AlertTriangle, PlusCircle } from "lucide-react";

const Dashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getIssues();
      if (res.success && Array.isArray(res.data)) {
        setIssues(res.data);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalReports = issues.length;
  const pendingCount = issues.filter((i) => i.status === ISSUE_STATUS.PENDING).length;
  const inProgressCount = issues.filter((i) => i.status === ISSUE_STATUS.IN_PROGRESS).length;
  const resolvedCount = issues.filter((i) => i.status === ISSUE_STATUS.RESOLVED).length;

  if (loading) {
    return <Loader fullScreen message="Loading Citizen Dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Citizen Summary Dashboard
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Overview of municipal reports, status metrics, and recent civic activities.
            </p>
          </div>
          <Link to={ROUTES.CITIZEN_REPORT}>
            <button className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-2xl shadow-lg shadow-teal-600/20 transition-all flex items-center gap-2">
              <PlusCircle size={16} />
              Report New Issue
            </button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Reports</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{totalReports}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{pendingCount}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{inProgressCount}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{resolvedCount}</h3>
            </div>
          </div>
        </div>

        {/* All Reports Listing */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Activity Reports</h2>
          {issues.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No civic issues recorded. Click "Report New Issue" above to submit one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
