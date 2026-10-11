import React from "react";
import { getStatusColor } from "../../utils/helpers";

const IssueStatusBadge = ({ status }) => {
  const formattedText =
    typeof status === "string"
      ? status.replace("_", " ").toUpperCase()
      : "PENDING";

  const colorStyle = getStatusColor(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider border shadow-sm ${colorStyle}`}
    >
      {formattedText}
    </span>
  );
};

export default IssueStatusBadge;