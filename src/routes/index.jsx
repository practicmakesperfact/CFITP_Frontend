
// import { createBrowserRouter, Navigate } from "react-router-dom";

// // Layout
// import AppShell from "../components/Layout/AppShell.jsx";

// // Auth Pages
// import Login from "../pages/Auth/Login.jsx";
// import Register from "../pages/Auth/Register.jsx";
// import MyFeedback from "../pages/Feedback/MyFeedback";

// // Dashboard
// import ClientDashboard from "../pages/Dashboards/ClientDashboard.jsx";
// import StaffDashboard from "../pages/Dashboards/StaffDashboard.jsx";
// import ManagerDashboard from "../pages/Dashboards/ManagerDashboard.jsx";
// import AdminDashboard from "../pages/Dashboards/AdminDashboard.jsx";

// // Issues & Feedback
// import IssuesPage from "../pages/Issues/IssuesPage.jsx";
// import IssueDetailPage from "../pages/Issues/IssueDetailPage.jsx";
// import NewIssuePage from "../pages/Issues/NewIssuePage.jsx";           // ← ADDED
// import FeedbackPage from "../pages/feedback/FeedbackPage.jsx";       // ← ADDED

// // Profile
// import ProfilePage from "../pages/ProfilePage.jsx";

// // Reports & Others (later)
// import ReportsPage from "../pages/reports/ReportsPage.jsx";
// import NotificationsPage from "../pages/notifications/NotificationsPage.jsx";

// // Auth Helper
// const isAuthenticated = () => !!localStorage.getItem("access_token");
// const getRole = () => localStorage.getItem("user_role") || "client";

// // Protected Route
// const ProtectedRoute = ({ children }) => {
//   return isAuthenticated() ? children : <Navigate to="/login" replace />;
// };

// // Role-Based Route
// const RoleRoute = ({ children, allowedRoles }) => {
//   const role = getRole();
//   return isAuthenticated() && allowedRoles.includes(role) ? children : <Navigate to="/unauthorized" replace />;
// };

// const router = createBrowserRouter([
//   // Public Routes
//   { path: "/login", element: <Login /> },
//   { path: "/register", element: <Register /> },

//   // Unauthorized Page
//   { path: "/unauthorized", element: <div className="p-20 text-center text-3xl font-bold">Unauthorized Access</div> },

//   // Main App (Protected)
//   {
//     path: "/",
//     element: <ProtectedRoute><AppShell /></ProtectedRoute>,
//     children: [
//       { path: "/", element: <Navigate to="/dashboard" replace /> },

//       // Dashboard - All Roles
//       {
//         path: "/dashboard",
//         element: (
//           <ProtectedRoute>
//             {getRole() === "client" && <ClientDashboard />}
//             {getRole() === "staff" && <StaffDashboard />}
//             {getRole() === "manager" && <ManagerDashboard />}
//             {getRole() === "admin" && <AdminDashboard />}
//           </ProtectedRoute>
//         ),
//       },

//       // Issues - CLIENT + STAFF + MANAGER + ADMIN
//       {
//         path: "/issues",
//         element: <ProtectedRoute><IssuesPage /></ProtectedRoute>,
//       },
   
//       {
//         path: "/issues/new",
//         element: <ProtectedRoute><NewIssuePage /></ProtectedRoute>,
//       },
//       {
//         path: "/issues/:id",
//         element: <ProtectedRoute><IssueDetailPage /></ProtectedRoute>,
//       },

//       // Feedback - Only Client
//       {
//         path: "/feedback/new",
//         element: <ProtectedRoute><FeedbackPage /></ProtectedRoute>,
//       },
//       {
//       path: "/feedback/my",
//       element: <MyFeedback />
//     },

//       // Profile - All
//       { path: "/profile", element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },

//       // Manager & Admin Only
//       {
//         path: "/reports",
//         element: <RoleRoute allowedRoles={["manager", "admin"]}><ReportsPage /></RoleRoute>,
//       },
//       {
//         path: "/notifications",
//         element: <RoleRoute allowedRoles={["manager", "admin"]}><NotificationsPage /></RoleRoute>,
//       },
//     ],
//   },

//   { path: "*", element: <Navigate to="/dashboard" replace /> },
// ]);

// export default router;


// import { createBrowserRouter, Navigate } from "react-router-dom";
// import ProtectedRoute from "./ProtectedRoute";
// import RoleRoute from "./RoleRoute";
// import DashboardRedirect from "../components/Dashboard/DashboardRedirect";

// // Auth Pages
// import Login from "../pages/Auth/Login";
// import Register from "../pages/Auth/Register";
// import ResetPassword from "../pages/Auth/ResetPassword";

// // Dashboard Pages
// import ClientDashboard from "../pages/Dashboards/ClientDashboard";
// import StaffDashboard from "../pages/Dashboards/StaffDashboard";
// import ManagerDashboard from "../pages/Dashboards/ManagerDashboard";
// import AdminDashboard from "../pages/Dashboards/AdminDashboard";

// // Other Pages
// import IssuesPage from "../pages/Issues/IssuesPage";
// import IssueDetailPage from "../pages/Issues/IssueDetailPage";
// import FeedbackPage from "../pages/Feedback/FeedbackPage";
// import ReportsPage from "../pages/Reports/ReportsPage";
// import NotificationsPage from "../pages/notifications/NotificationsPage";
// import ProfilePage from "../pages/Profile/ProfilePage";
// import ProfileEdit from "../pages/Profile/ProfileEdit";
// import ProfileViewer from "../pages/Profile/ProfileViewer";
// import UsersPage from "../pages/Users/UsersPage";

// // Create a simple error page component (add this temporarily)
// function ErrorPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4">
//       <div className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-10">
//         <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
//         <p className="text-gray-600 mb-4">Something went wrong.</p>
//         <button
//           onClick={() => (window.location.href = "/")}
//           className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-xl"
//         >
//           Go Home
//         </button>
//       </div>
//     </div>
//   );
// }

// // Create the router with createBrowserRouter
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Navigate to="/login" replace />,
//     errorElement: <ErrorPage />,
//   },
//   {
//     path: "/login",
//     element: <Login />,
//   },
//   {
//     path: "/register",
//     element: <Register />,
//   },
//   {
//     path: "/reset-password",
//     element: <ResetPassword />,
//   },
//   {
//     path: "/dashboard",
//     element: (
//       <ProtectedRoute>
//         <DashboardRedirect />
//       </ProtectedRoute>
//     ),
//     errorElement: <ErrorPage />,
//   },
//   {
//     path: "/dashboard/client",
//     element: (
//       <ProtectedRoute>
//         <RoleRoute allowedRoles={["client"]}>
//           <ClientDashboard />
//         </RoleRoute>
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/dashboard/staff",
//     element: (
//       <ProtectedRoute>
//         <RoleRoute allowedRoles={["staff"]}>
//           <StaffDashboard />
//         </RoleRoute>
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/dashboard/manager",
//     element: (
//       <ProtectedRoute>
//         <RoleRoute allowedRoles={["manager"]}>
//           <ManagerDashboard />
//         </RoleRoute>
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/dashboard/admin",
//     element: (
//       <ProtectedRoute>
//         <RoleRoute allowedRoles={["admin"]}>
//           <AdminDashboard />
//         </RoleRoute>
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/issues",
//     element: (
//       <ProtectedRoute>
//         <IssuesPage />
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/issues/:id",
//     element: (
//       <ProtectedRoute>
//         <IssueDetailPage />
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/feedback",
//     element: (
//       <ProtectedRoute>
//         <FeedbackPage />
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/reports",
//     element: (
//       <ProtectedRoute>
//         <RoleRoute allowedRoles={["manager", "admin"]}>
//           <ReportsPage />
//         </RoleRoute>
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/notifications",
//     element: (
//       <ProtectedRoute>
//         <NotificationsPage />
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/profile",
//     element: (
//       <ProtectedRoute>
//         <ProfilePage />
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/profile/edit",
//     element: (
//       <ProtectedRoute>
//         <ProfileEdit />
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/profile/view",
//     element: (
//       <ProtectedRoute>
//         <ProfileViewer />
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "/users",
//     element: (
//       <ProtectedRoute>
//         <RoleRoute allowedRoles={["admin"]}>
//           <UsersPage />
//         </RoleRoute>
//       </ProtectedRoute>
//     ),
//   },
//   {
//     path: "*",
//     element: (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4">
//         <div className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-10">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">
//             404 - Page Not Found
//           </h1>
//           <p className="text-gray-600 mb-4">
//             The page you're looking for doesn't exist.
//           </p>
//           <button
//             onClick={() => (window.location.href = "/")}
//             className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-xl"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     ),
//   },
// ]);




// export default router;

// import { createBrowserRouter, Navigate } from "react-router-dom";
// import ProtectedRoute from "./ProtectedRoute";
// import RoleRoute from "./RoleRoute";
// import DashboardRedirect from "../components/Dashboard/DashboardRedirect";
// import AppShell from "../components/Layout/AppShell"; // ← IMPORT AppShell

// // Auth Pages
// import Login from "../pages/Auth/Login";
// import Register from "../pages/Auth/Register";
// import ResetPassword from "../pages/Auth/ResetPassword";

// // Dashboard Pages
// import ClientDashboard from "../pages/Dashboards/ClientDashboard";
// import StaffDashboard from "../pages/Dashboards/StaffDashboard";
// import ManagerDashboard from "../pages/Dashboards/ManagerDashboard";
// import AdminDashboard from "../pages/Dashboards/AdminDashboard";

// // Other Pages
// import IssuesPage from "../pages/Issues/IssuesPage";
// import IssueDetailPage from "../pages/Issues/IssueDetailPage";
// import FeedbackPage from "../pages/Feedback/FeedbackPage";
// import ReportsPage from "../pages/Reports/ReportsPage";
// import NotificationsPage from "../pages/notifications/NotificationsPage";
// import ProfilePage from "../pages/Profile/ProfilePage";
// import ProfileEdit from "../pages/Profile/ProfileEdit";
// import ProfileViewer from "../pages/Profile/ProfileViewer";
// import UsersPage from "../pages/Users/UsersPage";

// // Create the router
// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Navigate to="/login" replace />,
//   },
//   {
//     path: "/login",
//     element: <Login />,
//   },
//   {
//     path: "/register",
//     element: <Register />,
//   },
//   {
//     path: "/reset-password",
//     element: <ResetPassword />,
//   },

//   // MAIN APP LAYOUT - This wraps ALL protected routes with AppShell
//   {
//     path: "/",
//     element: (
//       <ProtectedRoute>
//         <AppShell /> {/* ← AppShell wraps everything */}
//       </ProtectedRoute>
//     ),
//     children: [
//       // Dashboard Redirect
//       {
//         path: "/dashboard",
//         element: <DashboardRedirect />,
//       },

//       // Client Dashboard
//       {
//         path: "/dashboard/client",
//         element: (
//           <RoleRoute allowedRoles={["client"]}>
//             <ClientDashboard />
//           </RoleRoute>
//         ),
//       },

//       // Staff Dashboard
//       {
//         path: "/dashboard/staff",
//         element: (
//           <RoleRoute allowedRoles={["staff"]}>
//             <StaffDashboard />
//           </RoleRoute>
//         ),
//       },

//       // Manager Dashboard
//       {
//         path: "/dashboard/manager",
//         element: (
//           <RoleRoute allowedRoles={["manager"]}>
//             <ManagerDashboard />
//           </RoleRoute>
//         ),
//       },

//       // Admin Dashboard
//       {
//         path: "/dashboard/admin",
//         element: (
//           <RoleRoute allowedRoles={["admin"]}>
//             <AdminDashboard />
//           </RoleRoute>
//         ),
//       },

//       // Issues
//       {
//         path: "/issues",
//         element: <IssuesPage />,
//       },
//       {
//         path: "/issues/:id",
//         element: <IssueDetailPage />,
//       },

//       // Feedback
//       {
//         path: "/feedback",
//         element: <FeedbackPage />,
//       },

//       // Reports (Manager/Admin only)
//       {
//         path: "/reports",
//         element: (
//           <RoleRoute allowedRoles={["manager", "admin"]}>
//             <ReportsPage />
//           </RoleRoute>
//         ),
//       },

//       // Notifications
//       {
//         path: "/notifications",
//         element: <NotificationsPage />,
//       },

//       // Profile
//       {
//         path: "/profile",
//         element: <ProfilePage />,
//       },
//       {
//         path: "/profile/edit",
//         element: <ProfileEdit />,
//       },
//       {
//         path: "/profile/view",
//         element: <ProfileViewer />,
//       },

//       // Users (Admin only)
//       {
//         path: "/users",
//         element: (
//           <RoleRoute allowedRoles={["admin"]}>
//             <UsersPage />
//           </RoleRoute>
//         ),
//       },
//     ],
//   },

//   // 404 Page
//   {
//     path: "*",
//     element: (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4">
//         <div className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-10">
//           <h1 className="text-3xl font-bold text-gray-800 mb-2">
//             404 - Page Not Found
//           </h1>
//           <p className="text-gray-600 mb-4">
//             The page you're looking for doesn't exist.
//           </p>
//           <button
//             onClick={() => (window.location.href = "/")}
//             className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-xl"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     ),
//   },
// ]);

// export default router;


import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import DashboardRedirect from "../components/Dashboard/DashboardRedirect";
import AppShell from "../components/Layout/AppShell";

// Auth Pages
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ResetPassword from "../pages/Auth/ResetPassword";
import RequestAccess from "../pages/Auth/RequestAccess";

// Dashboard Pages
import ClientDashboard from "../pages/Dashboards/ClientDashboard";
import StaffDashboard from "../pages/Dashboards/StaffDashboard";
import ManagerDashboard from "../pages/Dashboards/ManagerDashboard";
import AdminDashboard from "../pages/Dashboards/AdminDashboard";

// Other Pages
import IssuesPage from "../pages/Issues/IssuesPage";
import IssueDetailPage from "../pages/Issues/IssueDetailPage";
import NewIssuePage from "../pages/Issues/NewIssuePage";
import FeedbackPage from "../pages/Feedback/FeedbackPage";

import ReportsPage from "../pages/Reports/ReportsPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import ProfileEdit from "../pages/Profile/ProfileEdit";
import ProfileViewer from "../pages/Profile/ProfileViewer";
import UsersPage from "../pages/Users/UsersPage";
import MyFeedback from './../pages/Feedback/MyFeedback';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/request-access" ,
    element:<RequestAccess />,
  },

  // PROTECTED APP LAYOUT
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      // ROLE-SPECIFIC DASHBOARD ROUTES
      {
        path: "dashboard/client",
        element: (
          <RoleRoute allowedRoles={["client"]}>
            <ClientDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "dashboard/staff",
        element: (
          <RoleRoute allowedRoles={["staff"]}>
            <StaffDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "dashboard/manager",
        element: (
          <RoleRoute allowedRoles={["manager"]}>
            <ManagerDashboard />
          </RoleRoute>
        ),
      },
      {
        path: "dashboard/admin",
        element: (
          <RoleRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleRoute>
        ),
      },

      // DASHBOARD REDIRECT (fallback - redirects to role-specific dashboard)
      {
        path: "dashboard",
        element: <DashboardRedirect />,
      },

      // ISSUES (ORDER IS CRITICAL!)
      { path: "issues/new", element: <NewIssuePage /> },
      { path: "issues/:id", element: <IssueDetailPage /> },
      { path: "issues", element: <IssuesPage /> },

      // FEEDBACK
      { path: "feedback", element: <FeedbackPage /> },
      { path: "feedback/my", element: <MyFeedback /> },

      // REPORTS (Manager/Admin only)
      {
        path: "reports",
        element: (
          <RoleRoute allowedRoles={["manager", "admin"]}>
            <ReportsPage />
          </RoleRoute>
        ),
      },

      // NOTIFICATIONS
      { path: "notifications", element: <NotificationsPage /> },

      // PROFILE
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/edit", element: <ProfileEdit /> },
      { path: "profile/view", element: <ProfileViewer /> },

      // USERS (Admin only)
      {
        path: "users",
        element: (
          <RoleRoute allowedRoles={["admin"]}>
            <UsersPage />
          </RoleRoute>
        ),
      },
    ],
  },

  // 404 PAGE
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            404 - Page Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The page you're looking for doesn't exist.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-xl"
          >
            Go to Login
          </button>
        </div>
      </div>
    ),
  },
]);

export default router;