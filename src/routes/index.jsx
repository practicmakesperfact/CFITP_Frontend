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
import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/Auth/Login.jsx";
import Register from "../pages/Auth/Register.jsx";
import ClientDashboard from "../pages/Dashboards/ClientDashboard.jsx";
import StaffDashboard from "../pages/Dashboards/StaffDashboard.jsx";
import ManagerDashboard from "../pages/Dashboards/ManagerDashboard.jsx";
import AdminDashboard from "../pages/Dashboards/AdminDashboard.jsx";
import IssuesPage from "../pages/Issues/IssuesPage.jsx";
import IssueDetailPage from "../pages/Issues/IssueDetailPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import AppShell from "../components/Layout/AppShell.jsx";
import { isAuthenticated } from "../utils/authHelper.js";

// Remove: import "../styles/globals.css"; ← DELETE THIS LINE

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem("user_role");
  return isAuthenticated() && allowedRoles.includes(role) ? (
    children
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

// Helper: Dashboard by role
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
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <Navigate to="/dashboard" replace /> },

      // DASHBOARD: Protected + Role-Based
      {
        path: "/dashboard",
        element: (
          <RoleRoute allowedRoles={["client", "staff", "manager", "admin"]}>
            <DashboardByRole />
          </RoleRoute>
        ),
      },

      // ISSUES: Only staff, manager, admin
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

      // PROFILE: All logged-in users
      {
        path: "/profile",
        element: (
          <RoleRoute allowedRoles={["client", "staff", "manager", "admin"]}>
            <ProfilePage />
          </RoleRoute>
        ),
      },
    ],
  },

  // Optional: Unauthorized page
  { path: "/unauthorized", element: <div>Access Denied</div> },
]);