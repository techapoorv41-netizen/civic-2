import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { generateAnalysis, getAnalysis } from "../../api/aiApi";
import ReportAnalysisChart from "../../components/charts/ReportAnalysisChart";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import { Sparkles, AlertTriangle, ArrowLeft, RefreshCw, Layers } from "lucide-react";

const AllReportAnalysis = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const res = await getAnalysis(id);
      if (res.success) {
        setAnalysis(res.data);
      }
      setLoading(false);
    };
    fetchAnalysis();
  }, [id]);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await generateAnalysis(id);
    if (res.success) {
      setAnalysis(res.data);
    }
    setGenerating(false);
  };

  if (loading) {
    return <Loader fullScreen message="Fetching AI Analysis metrics..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to={`/citizen/issue/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Issue #{id}
          </Link>

          <Button
            onClick={handleGenerate}
            variant="primary"
            size="sm"
            isLoading={generating}
          >
            <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
            Re-run AI Analysis
          </Button>
        </div>

        {/* Title Header */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-2 border border-teal-500/30">
              <Sparkles size={14} />
              AI Automated Diagnostic
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Report Intelligence & Severity Analysis
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Automated NLP category classification, duplicate assessment, and dispatch priority scoring.
            </p>
          </div>
        </div>

        {!analysis ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No analysis report generated yet. Click "Re-run AI Analysis" above to process this report.
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Severity Score Rating
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-teal-600 dark:text-teal-400">
                    {analysis.severityScore}
                  </span>
                  <span className="text-sm font-semibold text-slate-400">/ 10</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Priority status calculated based on safety impact and municipal hazard density.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Predicted Department Category
                </p>
                <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 block mt-1">
                  {analysis.predictedCategory}
                </span>
                <p className="text-[11px] text-slate-500 mt-2">
                  Categorized automatically to route directly to relevant municipal department.
                </p>
              </div>
            </div>

            {/* Duplicate Alert Notice */}
            {analysis.isDuplicate && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-amber-800 dark:text-amber-300 text-xs font-medium flex items-center gap-3">
                <AlertTriangle size={20} className="shrink-0 text-amber-600" />
                <span>
                  <strong>Duplicate Notice:</strong> Similar issues reported in this micro-location within the past 48 hours. Consolidated into primary repair ticket.
                </span>
              </div>
            )}

            {/* Visual Recharts Bar Chart */}
            <ReportAnalysisChart data={analysis.categoryBreakdown} />

          </div>
        )}

      </div>
    </div>
  );
};

export default AllReportAnalysis;