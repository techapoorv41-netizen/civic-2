import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { generateAnalysis, getAnalysis } from "..//api/aiApi";
import ReportAnalysisChart from "../../components/charts/ReportAnalysisChart";

function AllReportAnalysis() {
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
    return <p className="text-center text-gray-500 py-8">Loading analysis...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Report Analysis</h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Analysis"}
        </button>
      </div>

      {!analysis ? (
        <p className="text-gray-500">No analysis generated yet. Click the button above.</p>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Severity Score</p>
            <p className="text-2xl font-semibold text-gray-800">
              {analysis.severityScore} / 10
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Predicted Category</p>
            <p className="text-lg font-medium text-gray-800">
              {analysis.predictedCategory}
            </p>
          </div>

          {analysis.isDuplicate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
              ⚠️ This issue may be a duplicate of an existing report.
            </div>
          )}

          <ReportAnalysisChart data={analysis.categoryBreakdown} />
        </div>
      )}
    </div>
  );
}

export default AllReportAnalysis;