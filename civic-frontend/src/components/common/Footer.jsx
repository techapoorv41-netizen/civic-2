import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-center text-sm">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} CivicSense Platform. All rights reserved.</p>
        <div className="flex gap-4 font-medium text-slate-400">
          <Link to="/privacy" className="hover:text-teal-400 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-teal-400 transition-colors">Terms of Service</Link>
          <Link to="/support" className="hover:text-teal-400 transition-colors">Help Desk</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;