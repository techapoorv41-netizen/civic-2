import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getIssueById,
  getIssueHistory,
  getComments,
  addComment,
} from "../../api/issueApi";
import { getAnalysis } from "../../api/aiApi";
import IssueMap from "../../components/issue/IssueMap";
import IssueStatusBadge from "../../components/issue/IssueStatusBadge";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import { formatDate } from "../../utils/helpers";
import { Sparkles, Bot, MessageSquare, Clock, MapPin, Send, ArrowLeft } from "lucide-react";

const IssueDetail = () => {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      const [issueRes, historyRes, commentsRes, analysisRes] = await Promise.all([
        getIssueById(id),
        getIssueHistory(id),
        getComments(id),
        getAnalysis(id),
      ]);

      if (issueRes.success) setIssue(issueRes.data);
      if (historyRes.success && Array.isArray(historyRes.data)) setHistory(historyRes.data);
      if (commentsRes.success && Array.isArray(commentsRes.data)) setComments(commentsRes.data);
      if (analysisRes.success) setAnalysis(analysisRes.data);

      setLoading(false);
    };

    fetchAllData();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPostingComment(true);
    const res = await addComment(id, { text: newComment });
    if (res.success) {
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    }
    setPostingComment(false);
  };

  if (loading) {
    return <Loader fullScreen message="Loading issue details & timeline..." />;
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-govLight flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-govOrange">Issue Not Found</h2>
        <p className="text-xs text-govText mt-2">The requested issue ID does not exist or was removed.</p>
        <Link to="/citizen/dashboard" className="mt-4 px-4 py-2 bg-govNavy hover:bg-govSlate text-white rounded-xl text-xs font-semibold transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-govLight py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Back Nav & Quick AI Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            to="/citizen/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-govSlate hover:text-govNavy transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Reports
          </Link>

          <div className="flex items-center gap-2">
            <Link to={`/citizen/issue/${id}/analysis`}>
              <Button variant="outline" size="sm">
                <Sparkles size={14} className="text-govSlate" />
                AI Analysis Report
              </Button>
            </Link>
            <Link to={`/citizen/issue/${id}/ai-bot`}>
              <Button variant="primary" size="sm">
                <Bot size={14} />
                Ask AI Assistant
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Header & Status */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-govNavy uppercase tracking-wider bg-govLight px-2.5 py-1 rounded-lg border border-govSlate/20">
                {issue.category || "General"}
              </span>
              <h1 className="text-2xl font-extrabold text-govNavy mt-2">
                {issue.title}
              </h1>
              <p className="text-xs text-govText/70 mt-1">
                Reported on {formatDate(issue.createdAt)}
              </p>
            </div>
            <IssueStatusBadge status={issue.status} />
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy mb-2">Description</h3>
            <p className="text-sm text-govText leading-relaxed bg-govLight p-4 rounded-2xl border border-slate-200">
              {issue.description}
            </p>
          </div>

          {/* Image Evidence */}
          {issue.images && issue.images.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy mb-2">Photo Evidence</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {issue.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Evidence ${i + 1}`}
                    className="w-full h-36 object-cover rounded-2xl border border-slate-200 shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Location Map Pin */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy mb-2 flex items-center gap-1">
              <MapPin size={14} className="text-govSlate" />
              Pinned Location
            </h3>
            <IssueMap location={issue.location} />
          </div>

          {/* AI Brief Summary Box */}
          {analysis && (
            <div className="bg-govNavy border border-govSlate rounded-2xl p-4 text-white flex items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-govSlate/60 rounded-xl text-govOrange shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-govOrange uppercase tracking-wider">AI Severity Rating</h4>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Severity Score: <span className="font-extrabold text-white">{analysis.severityScore}/10</span> | Category: <span className="font-semibold text-slate-100">{analysis.predictedCategory}</span>
                  </p>
                </div>
              </div>
              <Link to={`/citizen/issue/${id}/analysis`}>
                <span className="text-xs font-semibold text-govOrange hover:underline whitespace-nowrap">Full Analysis &rarr;</span>
              </Link>
            </div>
          )}

          {/* Status Timeline */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy mb-4 flex items-center gap-1.5">
              <Clock size={14} className="text-govSlate" />
              Status Resolution Timeline
            </h3>
            <div className="space-y-3">
              {history.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-govOrange mt-1 shrink-0 shadow-sm shadow-govOrange/50" />
                  <div className="flex-1 bg-govLight p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-govNavy">{entry.status}</span>
                      <span className="text-[10px] text-govText/70">{entry.date}</span>
                    </div>
                    {entry.note && <p className="text-govText mt-1">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Discussion */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy flex items-center gap-1.5">
              <MessageSquare size={14} className="text-govSlate" />
              Community & Inspection Comments ({comments.length})
            </h3>

            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-govLight p-3.5 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-govSlate">
                    {typeof c.author === "object" && c.author !== null
                      ? `${c.author.name || "User"} (${(c.author.role || "citizen").toUpperCase()})`
                      : c.author || "User"}
                  </p>
                  <p className="text-xs text-govText mt-1">{c.text || c.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Post a comment or update inquiry..."
                className="flex-1 rounded-2xl bg-white border border-slate-300 px-4 py-2.5 text-xs text-govText focus:outline-none focus:ring-2 focus:ring-govSlate/20 focus:border-govSlate"
              />
              <Button type="submit" variant="primary" size="sm" isLoading={postingComment}>
                <Send size={14} />
                Post
              </Button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default IssueDetail;