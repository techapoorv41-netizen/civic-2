import React, { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen = true, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-govNavy/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-govLight/60">
          <h3 className="font-bold text-lg text-govNavy">{title || "Confirm Action"}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-xl text-govSlate hover:text-govNavy hover:bg-govLight transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto text-govText bg-white">{children}</div>
      </div>
    </div>
  );
};

export default Modal;