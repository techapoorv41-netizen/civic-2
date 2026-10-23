import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const ReportAnalysisChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-govText/70 text-xs bg-govLight rounded-2xl border border-slate-200">
        No analysis chart data available
      </div>
    );
  }

  return (
    <div className="w-full h-72 bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm">
      <h4 className="text-xs font-bold uppercase tracking-wider text-govNavy mb-4">
        Category Distribution Breakdown
      </h4>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" opacity={0.6} />
          <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#134074" }} />
          <YAxis tick={{ fontSize: 11, fill: "#134074" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0B2545",
              borderColor: "#134074",
              borderRadius: "12px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="count" fill="#D96B27" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReportAnalysisChart;
