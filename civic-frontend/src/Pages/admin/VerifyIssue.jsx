import { useState, useEffect } from "react";
import { getIssues, verifyIssue, deleteIssue } from "..//api/issueApi";
import IssueStatusBadge from "../../components/issue/IssueStatusBadge";

function VerifyIssue() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      const res = await getIssues({ isVerified: false });
      if (res.success) {
        setIssues(res.data);
      }
      setLoading(false);
    };
    fetchIssues();
  }, []);

  const handleVerify = async (issueId) => {
    const res = await verifyIssue(issueId);
    if (res.success) {
      setIssues((prev) => prev.filter((issue) => issue.id !== issueId));
    }
  };

  const handleDelete = async (issueId) => {
    const res = await deleteIssue(issueId);
    if (res.success) {
      setIssues((prev) => prev.filter((issue) => issue.id !== issueId));
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading issues...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Verify Issues</h2>

      {issues.length === 0 ? (
        <p className="text-gray-500">No issues pending verification.</p>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div>
                <p className="font-medium text-gray-800">{issue.title}</p>
                <IssueStatusBadge status={issue.status} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerify(issue.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
                >
                  Verify
                </button>
                <button
                  onClick={() => handleDelete(issue.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VerifyIssue;