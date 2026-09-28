import { Routes, Route } from "react-router-dom";

// Ronak pages
import Register from "../pages/Register";
import Login from "../pages/Login";
import Homepage from "../pages/citizen/Homepage";
import Dashboard from "../pages/citizen/Dashboard";
import MyReports from "../pages/citizen/MyReports";
import Notifications from "../pages/citizen/Notifications";
import OfficialDashboard from "../pages/official/OfficialDashboard";
import OfficialNotifications from "../pages/official/OfficialNotifications";
import ProtectedRoute from "../components/common/ProtectedRoute";

// Apoorv pages
import ReportIssue from "../pages/citizen/ReportIssue";
import IssueDetail from "../pages/citizen/IssueDetail";
import AllReportAnalysis from "../pages/citizen/AllReportAnalysis";
import AiReportBot from "../pages/citizen/AiReportBot";
import AllIssues from "../pages/official/AllIssues";
import HandleReports from "../pages/official/HandleReports";
import AdminDashboard from "../pages/admin/AdminDashboard";
import VerifyOfficials from "../pages/admin/VerifyOfficials";
import VerifyIssue from "../pages/admin/VerifyIssue";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Citizen routes */}
      <Route
        path="/citizen/home"
        element={<ProtectedRoute><Homepage /></ProtectedRoute>}
      />
      <Route
        path="/citizen/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/citizen/report"
        element={<ProtectedRoute><ReportIssue /></ProtectedRoute>}
      />
      <Route
        path="/citizen/my-reports"
        element={<ProtectedRoute><MyReports /></ProtectedRoute>}
      />
      <Route
        path="/citizen/issue/:id"
        element={<ProtectedRoute><IssueDetail /></ProtectedRoute>}
      />
      <Route
        path="/citizen/issue/:id/analysis"
        element={<ProtectedRoute><AllReportAnalysis /></ProtectedRoute>}
      />
      <Route
        path="/citizen/issue/:id/ai-bot"
        element={<ProtectedRoute><AiReportBot /></ProtectedRoute>}
      />
      <Route
        path="/citizen/notifications"
        element={<ProtectedRoute><Notifications /></ProtectedRoute>}
      />

      {/* Official routes */}
      <Route
        path="/official/dashboard"
        element={<ProtectedRoute><OfficialDashboard /></ProtectedRoute>}
      />
      <Route
        path="/official/all-issues"
        element={<ProtectedRoute><AllIssues /></ProtectedRoute>}
      />
      <Route
        path="/official/handle-reports"
        element={<ProtectedRoute><HandleReports /></ProtectedRoute>}
      />
      <Route
        path="/official/notifications"
        element={<ProtectedRoute><OfficialNotifications /></ProtectedRoute>}
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
      />
      <Route
        path="/admin/verify-officials"
        element={<ProtectedRoute><VerifyOfficials /></ProtectedRoute>}
      />
      <Route
        path="/admin/verify-issue"
        element={<ProtectedRoute><VerifyIssue /></ProtectedRoute>}
      />
    </Routes>
  );
}

export default AppRoutes;