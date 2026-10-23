import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({ fullScreen = false, message = "Loading..." }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-govNavy/40 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-200 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-govOrange animate-spin" />
          <p className="text-sm font-semibold text-govNavy">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-2">
      <Loader2 className="w-6 h-6 text-govOrange animate-spin" />
      {message && <p className="text-xs text-govText font-medium">{message}</p>}
    </div>
  );
};

export default Loader;
