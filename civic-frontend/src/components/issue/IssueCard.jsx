import React from "react";
import { useNavigate } from "react-router-dom";
import IssueStatusBadge from "./IssueStatusBadge";
import { formatDate } from "../../utils/helpers";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

const IssueCard = ({ issue }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/citizen/issue/${issue.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-teal-500/30 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex justify-between items-start gap-3 mb-3">
          <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-lg border border-teal-200/50 dark:border-teal-900/50">
            {issue.category || "General"}
          </span>
          <IssueStatusBadge status={issue.status} />
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
          {issue.title}
        </h3>

        <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {issue.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-slate-400" />
          <span>{formatDate(issue.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold group-hover:translate-x-1 transition-transform">
          <span>View</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};

export default IssueCard;