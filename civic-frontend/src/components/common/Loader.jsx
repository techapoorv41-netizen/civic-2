import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({ fullScreen = false, message = "Loading..." }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-2">
      <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
      {message && <p className="text-xs text-slate-500 font-medium">{message}</p>}
    </div>
  );
};

export default Loader;
