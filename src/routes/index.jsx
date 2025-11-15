import { createBrowserRouter, Navigate } from "react-router-dom";

// Auth
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
import ResetPassword from "../pages/Auth/ResetPassword.jsx";

// Dashboards
import ClientDashboard from "../pages/Dashboards/ClientDashboard.jsx";
import StaffDashboard from "../pages/Dashboards/StaffDashboard.jsx";
import ManagerDashboard from "../pages/Dashboards/ManagerDashboard.jsx";
import AdminDashboard from "../pages/Dashboards/AdminDashboard.jsx";

// Issues
import IssuesPage from "../pages/Issues/IssuesPage.jsx";
import IssueDetailPage from "../pages/Issues/IssueDetailPage.jsx";

// Profile
import ProfileViewer from "../pages/Profile/ProfileViewer.jsx";
import ProfileEdit from "../pages/Profile/ProfileEdit.jsx";

// Other Pages
import FeedbackPage from "../pages/feedback/FeedbackPage.jsx";
import ReportsPage from "../pages/reports/ReportsPage.jsx";
import NotificationsPage from "../pages/notifications/NotificationsPage.jsx";

// Layout
import AppShell from "../components/Layout/AppShell.jsx";

// Utils
import { isAuthenticated } from "../utils/authHelper.js";

// Basic Protected Route
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

/* 
// =======================
// ROLE-BASED ROUTE (DISABLED FOR NOW)
// Uncomment later when you add real restrictions
// =======================
const RoleRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem("user_role");
  return isAuthenticated() && allowedRoles.includes(role)
    ? children
    : <Navigate to="/unauthorized" replace />;
};
*/

// Dashboard loader (still needed)
const DashboardByRole = () => {
  const role = localStorage.getItem("user_role");
  switch (role) {
    case "client":
      return <ClientDashboard />;
    case "staff":
      return <StaffDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export const router = createBrowserRouter([
  // Public Routes
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // Protected Application
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },

      // Dashboard (no role restriction for now)
      { path: "/dashboard", element: <DashboardByRole /> },

      // Issues (ALL roles can access for now)
      { path: "/issues", element: <IssuesPage /> },
      { path: "/issues/:id", element: <IssueDetailPage /> },

      // Profile (all roles)
      { path: "/profile", element: <ProfileViewer /> },
      { path: "/profile/edit", element: <ProfileEdit /> },

      // Other pages (all allowed for now)
      { path: "/feedback", element: <FeedbackPage /> },
      { path: "/reports", element: <ReportsPage /> },
      { path: "/notifications", element: <NotificationsPage /> },
    ],
  },

  // Temporary: Hide unauthorized page during dev
  { path: "/unauthorized", element: <div /> },

  // Fallback
  { path: "*", element: <Navigate to="/login" replace /> },
]);
