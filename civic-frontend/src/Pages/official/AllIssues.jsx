import React, { useState, useEffect } from "react";
import { getIssues } from "../../api/issueApi";
import Sidebar from "../../components/common/Sidebar";
import IssueCard from "../../components/issue/IssueCard";
import Loader from "../../components/common/Loader";

const AllIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      const res = await getIssues();
      if (res.success && Array.isArray(res.data)) {
        setIssues(res.data);
      }
      setLoading(false);
    };
    fetchIssues();
  }, []);

  if (loading) {
    return <Loader fullScreen message="Fetching all municipal issues..." />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            All Municipal Issues
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Complete database of reported civic problems across all municipal zones.
          </p>
        </div>

        {issues.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No issues found in the registry.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AllIssues;