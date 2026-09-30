import React, { useState, useEffect } from "react";
import { getIssues } from "../../api/issueApi";
import IssueCard from "../../components/issue/IssueCard";
import Loader from "../../components/common/Loader";
import { ISSUE_STATUS } from "../../utils/constants";
import { Filter, Search } from "lucide-react";

const MyReports = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMyIssues = async () => {
      const res = await getIssues();
      if (res.success && Array.isArray(res.data)) {
        setIssues(res.data);
      }
      setLoading(false);
    };
    fetchMyIssues();
  }, []);

  const filteredIssues = issues.filter((issue) => {
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return <Loader fullScreen message="Fetching your submitted reports..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Filter, search, and track resolution timelines of issues you reported.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["all", ISSUE_STATUS.PENDING, ISSUE_STATUS.IN_PROGRESS, ISSUE_STATUS.RESOLVED].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>

        </div>

        {/* Grid List */}
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No matching reports found for your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyReports;
