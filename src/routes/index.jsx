// import { createBrowserRouter, Navigate } from "react-router-dom";
// import Login from "../pages/Auth/Login.jsx";
// // import "../styles/globals.css";
// import Register from "../pages/Auth/Register.jsx";
// import ClientDashboard from "../pages/Dashboards/ClientDashboard.jsx";
// import StaffDashboard from "../pages/Dashboards/StaffDashboard.jsx";
// import ManagerDashboard from "../pages/Dashboards/ManagerDashboard.jsx";
// import AdminDashboard from "../pages/Dashboards/AdminDashboard.jsx";
// import IssuesPage from "../pages/Issues/IssuesPage.jsx";
// import IssueDetailPage from "../pages/Issues/IssueDetailPage.jsx";
// import ProfilePage from "../pages/ProfilePage.jsx";
// import AppShell from "../components/Layout/AppShell.jsx";
// import { isAuthenticated } from "../utils/authHelper.js";

// const ProtectedRoute = ({ children }) => {
//   return isAuthenticated() ? children : <Navigate to="/login" />;
// };

// const RoleRoute = ({ children, allowedRoles }) => {
//   const role = localStorage.getItem("user_role");
//   return isAuthenticated() && allowedRoles.includes(role) ? (
//     children
//   ) : (
//     <Navigate to="/" />
//   );
// };

// export const router = createBrowserRouter([
//   { path: "/login", element: <Login /> },
//   { path: "/register", element: <Register /> },
//   {
//     element: (
//       <ProtectedRoute>
//         <AppShell />
//       </ProtectedRoute>
//     ),
//     children: [
//       { path: "/", element: <Navigate to="/dashboard" /> },
//       {
//         path: "/dashboard",
//         element: (
//           <>
//             {localStorage.getItem("user_role") === "client" && (
//               <ClientDashboard />
//             )}
//             {localStorage.getItem("user_role") === "staff" && (
//               <StaffDashboard />
//             )}
//             {localStorage.getItem("user_role") === "manager" && (
//               <ManagerDashboard />
//             )}
//             {localStorage.getItem("user_role") === "admin" && (
//               <AdminDashboard />
//             )}
//           </>
//         ),
//       },
//       { path: "/issues", element: <IssuesPage /> },
//       { path: "/issues/:id", element: <IssueDetailPage /> },
//       { path: "/profile", element: <ProfilePage /> },
//     ],
//   },
// ]);

// src/routes/index.jsx
// src/routes/index.jsx
// src/routes/index.jsx
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

// Pages (now in subfolders)
import FeedbackPage from "../pages/feedback/FeedbackPage.jsx";
import ReportsPage from "../pages/reports/ReportsPage.jsx";
import NotificationsPage from "../pages/notifications/NotificationsPage.jsx";

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
  const role = localStorage.getItem("user_role");
  return isAuthenticated() && allowedRoles.includes(role) ? (
    children
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

// Dashboard by Role
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

  // Protected App Shell
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },

      // Dashboard
      {
        path: "/dashboard",
        element: (
          <RoleRoute allowedRoles={["client", "staff", "manager", "admin"]}>
            <DashboardByRole />
          </RoleRoute>
        ),
      },

      // Issues
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

      // Profile
      {
        path: "/profile",
        element: (
          <RoleRoute allowedRoles={["client", "staff", "manager", "admin"]}>
            <ProfileViewer />
          </RoleRoute>
        ),
      },
      {
        path: "/profile/edit",
        element: (
          <RoleRoute allowedRoles={["client", "staff", "manager", "admin"]}>
            <ProfileEdit />
          </RoleRoute>
        ),
      },

      // Pages in subfolders
      {
        path: "/feedback",
        element: (
          <RoleRoute allowedRoles={["client", "staff", "manager", "admin"]}>
            <FeedbackPage />
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
        path: "/notifications",
        element: (
          <RoleRoute allowedRoles={["client", "staff", "manager", "admin"]}>
            <NotificationsPage />
          </RoleRoute>
        ),
      },
    ],
  },

  // Fallback
  { path: "/unauthorized", element: <div className="p-8 text-center text-2xl">Access Denied</div> },
  { path: "*", element: <Navigate to="/login" replace /> },
]);