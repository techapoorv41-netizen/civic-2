import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRedirect from "./RoleRedirect";
import { ROLES, ROUTES } from "../utils/constants";
// Auth Pages
import Register from "../Pages/auth/Register";
import Login from "../Pages/auth/Login";

// Public Info Pages
import { PrivacyPolicy, TermsOfService, HelpDesk } from "../Pages/public/InfoPages";

// Citizen Pages
import Homepage from "../Pages/citizen/Homepage";
import Dashboard from "../Pages/citizen/Dashboard";
import ReportIssue from "../Pages/citizen/ReportIssue";
import MyReports from "../Pages/citizen/MyReports";
import IssueDetail from "../Pages/citizen/IssueDetail";
import AllReportAnalysis from "../Pages/citizen/AllReportAnalysis";
import Notifications from "../Pages/citizen/Notifications";
import AiReportBot from "../Pages/citizen/AiReportBot";

// Official Pages
import OfficialDashboard from "../Pages/official/OfficialDashboard";
import AllIssues from "../Pages/official/AllIssues";
import HandleReports from "../Pages/official/HandleReports";
import OfficialNotifications from "../Pages/official/OfficialNotifications";

// Admin Pages
import AdminDashboard from "../Pages/admin/AdminDashboard";
import VerifyOfficials from "../Pages/admin/VerifyOfficials";
import VerifyIssue from "../Pages/admin/VerifyIssue";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RoleRedirect />} />

      {/* Public Auth Routes */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />

      {/* Public Info Routes */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/support" element={<HelpDesk />} />

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
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN, ROLES.OFFICIAL, ROLES.ADMIN]}>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_AI_BOT}
        element={
          <ProtectedRoute allowedRoles={[ROLES.CITIZEN, ROLES.OFFICIAL, ROLES.ADMIN]}>
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