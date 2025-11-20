// // src/routes/index.jsx
// import { createBrowserRouter, Navigate } from "react-router-dom";
// import DashboardByRole from "../components/DashboardByRole.jsx";

// // Auth
// import Login from "../pages/Auth/Login.jsx";
// import Register from "../pages/Auth/Register.jsx";
// import ResetPassword from "../pages/Auth/ResetPassword.jsx";

// // Pages
// import IssuesPage from "../pages/Issues/IssuesPage.jsx";
// import IssueDetailPage from "../pages/Issues/IssueDetailPage.jsx";
// import ProfileViewer from "../pages/Profile/ProfileViewer.jsx";
// import ProfileEdit from "../pages/Profile/ProfileEdit.jsx";
// import FeedbackPage from "../pages/feedback/FeedbackPage.jsx";
// import ReportsPage from "../pages/reports/ReportsPage.jsx";
// import NotificationsPage from "../pages/notifications/NotificationsPage.jsx";
// import UsersPage from "../pages/Users/UsersPage.jsx"; // ← NEW

// // Layout
// import AppShell from "../components/Layout/AppShell.jsx";

// // Utils
// import { isAuthenticated } from "../utils/authHelper.js";

// // Protected Route
// const ProtectedRoute = ({ children }) => {
//   return isAuthenticated() ? children : <Navigate to="/login" replace />;
// };

// // Role-Based Route
// const RoleRoute = ({ children, allowedRoles }) => {
//   const role = localStorage.getItem("user_role") || "client";
//   return isAuthenticated() && allowedRoles.includes(role) ? (
//     children
//   ) : (
//     <Navigate to="/unauthorized" replace />
//   );
// };

// export const router = createBrowserRouter([
//   // Public
//   { path: "/login", element: <Login /> },
//   { path: "/register", element: <Register /> },
//   { path: "/reset-password", element: <ResetPassword /> },

//   // Protected App
//   {
//     element: (
//       <ProtectedRoute>
//         <AppShell />
//       </ProtectedRoute>
//     ),
//     children: [
//       { path: "/", element: <Navigate to="/dashboard" replace /> },
//       { path: "/dashboard", element: <DashboardByRole /> },

//       // Role-Protected Routes
//       {
//         path: "/issues",
//         element: (
//           <RoleRoute allowedRoles={["staff", "manager", "admin"]}>
//             <IssuesPage />
//           </RoleRoute>
//         ),
//       },
//       {
//         path: "/issues/:id",
//         element: (
//           <RoleRoute allowedRoles={["staff", "manager", "admin"]}>
//             <IssueDetailPage />
//           </RoleRoute>
//         ),
//       },
//       {
//         path: "/reports",
//         element: (
//           <RoleRoute allowedRoles={["manager", "admin"]}>
//             <ReportsPage />
//           </RoleRoute>
//         ),
//       },
//       {
//         path: "/feedback",
//         element: (
//           <RoleRoute allowedRoles={["admin"]}>
//             <FeedbackPage />
//           </RoleRoute>
//         ),
//       },
//       {
//         path: "/notifications",
//         element: (
//           <RoleRoute allowedRoles={["admin"]}>
//             <NotificationsPage />
//           </RoleRoute>
//         ),
//       },
//       {
//         path: "/users",
//         element: (
//           <RoleRoute allowedRoles={["admin"]}>
//             <UsersPage />
//           </RoleRoute>
//         ),
//       },

//       // Always allowed
//       { path: "/profile", element: <ProfileViewer /> },
//       { path: "/profile/edit", element: <ProfileEdit /> },
//     ],
//   },

//   {
//     path: "/unauthorized",
//     element: (
//       <div className="p-10 text-center text-2xl">Unauthorized Access</div>
//     ),
//   },
//   { path: "*", element: <Navigate to="/login" replace /> },
// ]);
// src/routes/index.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";

// Layout
import AppShell from "../components/Layout/AppShell.jsx";

// Auth Pages
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";

// Dashboard
import ClientDashboard from "../pages/Dashboards/ClientDashboard.jsx";
import StaffDashboard from "../pages/Dashboards/StaffDashboard.jsx";
import ManagerDashboard from "../pages/Dashboards/ManagerDashboard.jsx";
import AdminDashboard from "../pages/Dashboards/AdminDashboard.jsx";

// Issues & Feedback
import IssuesPage from "../pages/Issues/IssuesPage.jsx";
import IssueDetailPage from "../pages/Issues/IssueDetailPage.jsx";
import NewIssuePage from "../pages/Issues/NewIssuePage.jsx";           // ← ADDED
import FeedbackPage from "../pages/feedback/FeedbackPage.jsx";       // ← ADDED

// Profile
import ProfilePage from "../pages/ProfilePage.jsx";

// Reports & Others (later)
import ReportsPage from "../pages/reports/ReportsPage.jsx";
import NotificationsPage from "../pages/notifications/NotificationsPage.jsx";

// Auth Helper
const isAuthenticated = () => !!localStorage.getItem("access_token");
const getRole = () => localStorage.getItem("user_role") || "client";

// Protected Route
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Role-Based Route
const RoleRoute = ({ children, allowedRoles }) => {
  const role = getRole();
  return isAuthenticated() && allowedRoles.includes(role) ? children : <Navigate to="/unauthorized" replace />;
};

const router = createBrowserRouter([
  // Public Routes
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  // Unauthorized Page
  { path: "/unauthorized", element: <div className="p-20 text-center text-3xl font-bold">Unauthorized Access</div> },

  // Main App (Protected)
  {
    path: "/",
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },

      // Dashboard - All Roles
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            {getRole() === "client" && <ClientDashboard />}
            {getRole() === "staff" && <StaffDashboard />}
            {getRole() === "manager" && <ManagerDashboard />}
            {getRole() === "admin" && <AdminDashboard />}
          </ProtectedRoute>
        ),
      },

      // Issues - CLIENT + STAFF + MANAGER + ADMIN
      {
        path: "/issues",
        element: <ProtectedRoute><IssuesPage /></ProtectedRoute>,
      },
      {
        path: "/issues/new",
        element: <ProtectedRoute><NewIssuePage /></ProtectedRoute>,
      },
      {
        path: "/issues/:id",
        element: <ProtectedRoute><IssueDetailPage /></ProtectedRoute>,
      },

      // Feedback - Only Client
      {
        path: "/feedback/new",
        element: <ProtectedRoute><FeedbackPage /></ProtectedRoute>,
      },

      // Profile - All
      { path: "/profile", element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },

      // Manager & Admin Only
      {
        path: "/reports",
        element: <RoleRoute allowedRoles={["manager", "admin"]}><ReportsPage /></RoleRoute>,
      },
      {
        path: "/notifications",
        element: <RoleRoute allowedRoles={["manager", "admin"]}><NotificationsPage /></RoleRoute>,
      },
    ],
  },

  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);

export default router;