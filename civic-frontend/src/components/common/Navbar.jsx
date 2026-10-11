import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { ShieldAlert, Bell, LogOut, Menu, X, User } from "lucide-react";
import { ROLES, ROUTES } from "../../utils/constants";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === ROLES.CITIZEN) {
      return [
        { name: "Home", path: ROUTES.CITIZEN_HOME },
        { name: "Dashboard", path: ROUTES.CITIZEN_DASHBOARD },
        { name: "Report Issue", path: ROUTES.CITIZEN_REPORT },
        { name: "My Reports", path: ROUTES.CITIZEN_MY_REPORTS },
      ];
    }
    if (user.role === ROLES.OFFICIAL) {
      return [
        { name: "Overview", path: ROUTES.OFFICIAL_DASHBOARD },
        { name: "All Issues", path: ROUTES.OFFICIAL_ALL_ISSUES },
        { name: "Handle Reports", path: ROUTES.OFFICIAL_HANDLE_REPORTS },
        { name: "Notifications", path: ROUTES.OFFICIAL_NOTIFICATIONS },
      ];
    }
    if (user.role === ROLES.ADMIN) {
      return [
        { name: "Admin Console", path: ROUTES.ADMIN_DASHBOARD },
        { name: "Verify Officials", path: ROUTES.ADMIN_VERIFY_OFFICIALS },
        { name: "Verify Issues", path: ROUTES.ADMIN_VERIFY_ISSUE },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const notificationPath =
    user?.role === ROLES.OFFICIAL
      ? ROUTES.OFFICIAL_NOTIFICATIONS
      : ROUTES.CITIZEN_NOTIFICATIONS;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert size={22} />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Civic<span className="text-teal-400">Sense</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={notificationPath}
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                  <User size={16} className="text-teal-400" />
                  <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 font-bold capitalize">
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut size={20} />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;