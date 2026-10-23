import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, CheckSquare, ShieldCheck, Bell, FileText, Settings } from "lucide-react";
import { ROLES, ROUTES } from "../../utils/constants";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || (user.role !== ROLES.OFFICIAL && user.role !== ROLES.ADMIN)) {
    return null;
  }

  const links =
    user.role === ROLES.ADMIN
      ? [
          { name: "Overview Dashboard", path: ROUTES.ADMIN_DASHBOARD, icon: <LayoutDashboard size={18} /> },
          { name: "Verify Officials", path: ROUTES.ADMIN_VERIFY_OFFICIALS, icon: <ShieldCheck size={18} /> },
          { name: "Verify Issues", path: ROUTES.ADMIN_VERIFY_ISSUE, icon: <CheckSquare size={18} /> },
        ]
      : [
          { name: "Overview Dashboard", path: ROUTES.OFFICIAL_DASHBOARD, icon: <LayoutDashboard size={18} /> },
          { name: "All Issues", path: ROUTES.OFFICIAL_ALL_ISSUES, icon: <FileText size={18} /> },
          { name: "Handle Assignments", path: ROUTES.OFFICIAL_HANDLE_REPORTS, icon: <CheckSquare size={18} /> },
          { name: "Notifications", path: ROUTES.OFFICIAL_NOTIFICATIONS, icon: <Bell size={18} /> },
        ];

  return (
    <aside className="w-64 bg-govNavy border-r border-govSlate text-slate-200 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="mb-6 px-3 py-2 bg-govSlate/60 rounded-xl border border-govSlate">
        <p className="text-[11px] font-bold text-govOrange uppercase tracking-wider">
          {user.role} Portal
        </p>
        <p className="text-sm font-bold text-white truncate">{user.name}</p>
      </div>

      <nav className="flex flex-col gap-1.5">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-govOrange text-white shadow-md shadow-govOrange/20 font-bold"
                  : "hover:bg-govSlate text-slate-200 hover:text-white"
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;