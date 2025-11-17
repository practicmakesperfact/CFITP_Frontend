// src/routes/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardByRole from "../components/DashboardByRole.jsx";

// Auth
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
import ResetPassword from "../pages/Auth/ResetPassword.jsx";

// Pages
import IssuesPage from "../pages/Issues/IssuesPage.jsx";
import IssueDetailPage from "../pages/Issues/IssueDetailPage.jsx";
import ProfileViewer from "../pages/Profile/ProfileViewer.jsx";
import ProfileEdit from "../pages/Profile/ProfileEdit.jsx";
import FeedbackPage from "../pages/feedback/FeedbackPage.jsx";
import ReportsPage from "../pages/reports/ReportsPage.jsx";
import NotificationsPage from "../pages/notifications/NotificationsPage.jsx";
import UsersPage from "../pages/Users/UsersPage.jsx"; // ← NEW

// Layout
import AppShell from "../components/Layout/AppShell.jsx";

// Utils
import { isAuthenticated } from "../utils/authHelper.js";

// Protected Route
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Role-Based Route
const RoleRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem("user_role") || "client";
  return isAuthenticated() && allowedRoles.includes(role) ? (
    children
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

export const router = createBrowserRouter([
  // Public
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/reset-password", element: <ResetPassword /> },

  // Protected App
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },
      { path: "/dashboard", element: <DashboardByRole /> },

      // Role-Protected Routes
      {
        path: "/issues",
        element: (
          <RoleRoute allowedRoles={["staff", "manager", "admin"]}>
            <IssuesPage />
          </RoleRoute>
        ),
      },
      {
        path: "/issues/:id",
        element: (
          <RoleRoute allowedRoles={["staff", "manager", "admin"]}>
            <IssueDetailPage />
          </RoleRoute>
        ),
      },
      {
        path: "/reports",
        element: (
          <RoleRoute allowedRoles={["manager", "admin"]}>
            <ReportsPage />
          </RoleRoute>
        ),
      },
      {
        path: "/feedback",
        element: (
          <RoleRoute allowedRoles={["admin"]}>
            <FeedbackPage />
          </RoleRoute>
        ),
      },
      {
        path: "/notifications",
        element: (
          <RoleRoute allowedRoles={["admin"]}>
            <NotificationsPage />
          </RoleRoute>
        ),
      },
      {
        path: "/users",
        element: (
          <RoleRoute allowedRoles={["admin"]}>
            <UsersPage />
          </RoleRoute>
        ),
      },

      // Always allowed
      { path: "/profile", element: <ProfileViewer /> },
      { path: "/profile/edit", element: <ProfileEdit /> },
    ],
  },

  {
    path: "/unauthorized",
    element: (
      <div className="p-10 text-center text-2xl">Unauthorized Access</div>
    ),
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
