import { useNavigate } from "react-router-dom";
import IssueStatusBadge from "./IssueStatusBadge";

function IssueCard({ issue }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/citizen/issue/${issue.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer bg-white"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{issue.title}</h3>
        <IssueStatusBadge status={issue.status} />
      </div>
      <p className="text-sm text-gray-500 capitalize">
        Priority: {issue.priority}
      </p>
    </div>
  );
}

export default IssueCard;