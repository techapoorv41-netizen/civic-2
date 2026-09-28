import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function ReportAnalysisChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg">
        No analysis data available
      </div>
    );
  }

  return (
    <div className="w-full h-72 bg-white border border-gray-200 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ReportAnalysisChart;