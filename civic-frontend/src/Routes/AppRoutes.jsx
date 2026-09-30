import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRedirect from "./RoleRedirect";
import { ROLES, ROUTES } from "../utils/constants";

// Auth Pages
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";

// Citizen Pages
import Homepage from "../pages/citizen/Homepage";
import Dashboard from "../pages/citizen/Dashboard";
import ReportIssue from "../pages/citizen/ReportIssue";
import MyReports from "../pages/citizen/MyReports";
import IssueDetail from "../pages/citizen/IssueDetail";
import AllReportAnalysis from "../pages/citizen/AllReportAnalysis";
import Notifications from "../pages/citizen/Notifications";
import AiReportBot from "../pages/citizen/AiReportBot";

// Official Pages
import OfficialDashboard from "../pages/official/OfficialDashboard";
import AllIssues from "../pages/official/AllIssues";
import HandleReports from "../pages/official/HandleReports";
import OfficialNotifications from "../pages/official/OfficialNotifications";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import VerifyOfficials from "../pages/admin/VerifyOfficials";
import VerifyIssue from "../pages/admin/VerifyIssue";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RoleRedirect />} />

      {/* Public Auth Routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />

      {/* Citizen Protected Routes */}
      <Route
        path={ROUTES.CITIZEN_HOME}
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
            <Homepage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_REPORT}
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
            <ReportIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_MY_REPORTS}
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
            <MyReports />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_ISSUE_DETAIL}
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN, ROLES.OFFICIAL, ROLES.ADMIN]}>
            <IssueDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_ANALYSIS}
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN, ROLES.OFFICIAL, ROLES.ADMIN]}>
            <AllReportAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_NOTIFICATIONS}
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_AI_BOT}
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN]}>
            <AiReportBot />
          </ProtectedRoute>
        }
      />

      {/* Official Protected Routes */}
      <Route
        path={ROUTES.OFFICIAL_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICIAL]}>
            <OfficialDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.OFFICIAL_ALL_ISSUES}
        element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICIAL]}>
            <AllIssues />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.OFFICIAL_HANDLE_REPORTS}
        element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICIAL]}>
            <HandleReports />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.OFFICIAL_NOTIFICATIONS}
        element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICIAL]}>
            <OfficialNotifications />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_VERIFY_OFFICIALS}
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <VerifyOfficials />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_VERIFY_ISSUE}
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <VerifyIssue />
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch-All */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
};

export default AppRoutes;