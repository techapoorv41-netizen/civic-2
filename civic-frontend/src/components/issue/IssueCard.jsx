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
      className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:border-govSlate/40 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex justify-between items-start gap-3 mb-3">
          <span className="text-[11px] font-bold text-govNavy uppercase tracking-wider bg-govLight px-2.5 py-1 rounded-lg border border-govSlate/20">
            {issue.category || "General"}
          </span>
          <IssueStatusBadge status={issue.status} />
        </div>

        <h3 className="font-bold text-base text-govNavy group-hover:text-govOrange transition-colors line-clamp-1">
          {issue.title}
        </h3>

        <p className="mt-2 text-xs text-govText line-clamp-2 leading-relaxed">
          {issue.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-govText/70">
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-govSlate" />
          <span>{formatDate(issue.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1 text-govOrange font-semibold group-hover:translate-x-1 transition-transform">
          <span>View</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
};

export default IssueCard;