function IssueStatusBadge({ status }) {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    in_progress: "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const statusText = {
    pending: "Pending",
    in_progress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        statusStyles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {statusText[status] || status}
    </span>
  );
}

export default IssueStatusBadge;