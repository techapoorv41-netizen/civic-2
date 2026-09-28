import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getIssueById,
  getIssueHistory,
  getComments,
  addComment,
} from "../../api/issueApi";
import { getAnalysis } from "../../api/aiApi";
import IssueMap from "../../components/issue/IssueMap";
import IssueStatusBadge from "../../components/issue/IssueStatusBadge";

function IssueDetail() {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      const [issueRes, historyRes, commentsRes, analysisRes] = await Promise.all([
        getIssueById(id),
        getIssueHistory(id),
        getComments(id),
        getAnalysis(id),
      ]);

      if (issueRes.success) setIssue(issueRes.data);
      if (historyRes.success) setHistory(historyRes.data);
      if (commentsRes.success) setComments(commentsRes.data);
      if (analysisRes.success) setAnalysis(analysisRes.data);

      setLoading(false);
    };

    fetchAllData();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const res = await addComment(id, { text: newComment });
    if (res.success) {
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading issue...</p>;
  }

  if (!issue) {
    return <p className="text-center text-red-500 py-8">Issue not found.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl font-semibold text-gray-800">{issue.title}</h1>
          <IssueStatusBadge status={issue.status} />
        </div>
        <p className="text-gray-600 text-sm">{issue.description}</p>
      </div>

      {/* Images */}
      {issue.images && issue.images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {issue.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Issue ${i}`}
              className="w-full h-24 object-cover rounded-md"
            />
          ))}
        </div>
      )}

      {/* Map */}
      <IssueMap location={issue.location} />

      {/* AI Analysis (if available) */}
      {analysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">AI Analysis</p>
          <p className="text-sm text-blue-700">
            Severity: {analysis.severityScore}/10 · Category: {analysis.predictedCategory}
          </p>
        </div>
      )}

      {/* Status Timeline */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Status Timeline</h2>
        <div className="space-y-2">
          {history.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{entry.status}</span>
              <span className="text-gray-400">— {entry.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Comments</h2>
        <div className="space-y-2 mb-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-gray-50 rounded-md p-2 text-sm">
              <p className="font-medium text-gray-700">{c.author}</p>
              <p className="text-gray-600">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default IssueDetail;