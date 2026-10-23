import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getIssues } from "../../api/issueApi";
import IssueCard from "../../components/issue/IssueCard";
import Button from "../../components/common/Button";
import { ROUTES } from "../../utils/constants";
import { PlusCircle, Bot, ShieldAlert, Sparkles, Activity } from "lucide-react";

const Homepage = () => {
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      const res = await getIssues();
      if (res.success && Array.isArray(res.data)) {
        setRecentIssues(res.data.slice(0, 3));
      }
      setLoading(false);
    };
    fetchRecent();
  }, []);

  return (
    <div className="min-h-screen bg-govLight py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <div className="bg-govNavy rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-slate-100 border border-white/20">
              <Sparkles size={14} className="text-govOrange" />
              <span>CivicSense Smart Resolution System</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Transform Your City. Report Civic Issues Effortlessly.
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Snap a picture, pin the location, and let automated AI analysis assign local department officials in real-time.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link to={ROUTES.CITIZEN_REPORT}>
                <Button variant="primary" size="lg" className="shadow-lg">
                  <PlusCircle size={18} />
                  Report New Issue
                </Button>
              </Link>
              <Link to={ROUTES.CITIZEN_MY_REPORTS}>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  <Activity size={18} />
                  Track My Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-govLight text-govSlate flex items-center justify-center mb-4">
              <PlusCircle size={24} />
            </div>
            <h3 className="font-bold text-lg text-govNavy">1-Click Reporting</h3>
            <p className="text-xs text-govText mt-2 leading-relaxed">
              Upload photo evidence and location details directly to municipal administration.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-govLight text-govOrange flex items-center justify-center mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="font-bold text-lg text-govNavy">AI Severity Analysis</h3>
            <p className="text-xs text-govText mt-2 leading-relaxed">
              Automated category detection, duplicate checking, and severity scoring algorithms.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-govLight text-govSlate flex items-center justify-center mb-4">
              <Bot size={24} />
            </div>
            <h3 className="font-bold text-lg text-govNavy">AI Assistant Bot</h3>
            <p className="text-xs text-govText mt-2 leading-relaxed">
              Ask questions about resolution timelines and repair guidelines 24/7.
            </p>
          </div>
        </div>

        {/* Recent Community Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-govNavy">
              Recent Reported Issues
            </h2>
            <Link to={ROUTES.CITIZEN_DASHBOARD} className="text-xs font-semibold text-govSlate hover:text-govOrange transition-colors hover:underline">
              View All Dashboard Reports &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-govText">Loading recent reports...</div>
          ) : recentIssues.length === 0 ? (
            <div className="p-8 text-center text-xs text-govText bg-white rounded-3xl border border-slate-200">
              No issues reported yet. Be the first to report!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Homepage;
