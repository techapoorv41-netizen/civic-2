import React from "react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>&copy; {new Date().getFullYear()} CivicSense Platform. All rights reserved.</p>
        <div className="flex gap-4 font-medium text-slate-400">
          <a href="#privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-teal-400 transition-colors">Terms of Service</a>
          <a href="#support" className="hover:text-teal-400 transition-colors">Help Desk</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
