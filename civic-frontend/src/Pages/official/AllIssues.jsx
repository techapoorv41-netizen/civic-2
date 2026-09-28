import { useState, useEffect } from "react";
import { getIssues } from "..//api/issueApi";
import IssueCard from "../../components/issue/IssueCard";

function AllIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      const res = await getIssues();
      if (res.success) {
        setIssues(res.data);
      }
      setLoading(false);
    };
    fetchIssues();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading issues...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">All Issues</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}

export default AllIssues;