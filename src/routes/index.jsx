
// import { createBrowserRouter, Navigate } from "react-router-dom";
// import ProtectedRoute from "./ProtectedRoute";
// import RoleRoute from "./RoleRoute";
// import DashboardRedirect from "../components/Dashboard/DashboardRedirect";
// import AppShell from "../components/Layout/AppShell";

// // Auth Pages
// import Login from "../pages/Auth/Login";
// import Register from "../pages/Auth/Register";
// import ResetPassword from "../pages/Auth/ResetPassword";
// import RequestAccess from "../pages/Auth/RequestAccess";

// // Dashboard Pages
// import ClientDashboard from "../pages/Dashboards/ClientDashboard";
// import StaffDashboard from "../pages/Dashboards/StaffDashboard";
// import ManagerDashboard from "../pages/Dashboards/ManagerDashboard";
// import AdminDashboard from "../pages/Dashboards/AdminDashboard";

// // Other Pages
// import IssuesPage from "../pages/Issues/IssuesPage";
// import IssueDetailPage from "../pages/Issues/IssueDetailPage";
// import NewIssuePage from "../pages/Issues/NewIssuePage";
// import FeedbackPage from "../pages/Feedback/FeedbackPage";

// import ReportsPage from "../pages/Reports/ReportsPage";
// import NotificationsPage from "../pages/notifications/NotificationsPage";
// import ProfilePage from "../pages/Profile/ProfilePage";
// import ProfileEdit from "../pages/Profile/ProfileEdit";
// import ProfileViewer from "../pages/Profile/ProfileViewer";
// import UsersPage from "../pages/Users/UsersPage";
// import MyFeedback from './../pages/Feedback/MyFeedback';

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
//   {
//     path: "/request-access" ,
//     element:<RequestAccess />,
//   },

//   // PROTECTED APP LAYOUT
//   {
//     path: "/app",
//     element: (
//       <ProtectedRoute>
//         <AppShell />
//       </ProtectedRoute>
//     ),
//     children: [
//       // ROLE-SPECIFIC DASHBOARD ROUTES
//       {
//         path: "dashboard/client",
//         element: (
//           <RoleRoute allowedRoles={["client"]}>
//             <ClientDashboard />
//           </RoleRoute>
//         ),
//       },
//       {
//         path: "dashboard/staff",
//         element: (
//           <RoleRoute allowedRoles={["staff"]}>
//             <StaffDashboard />
//           </RoleRoute>
//         ),
//       },
//       {
//         path: "dashboard/manager",
//         element: (
//           <RoleRoute allowedRoles={["manager"]}>
//             <ManagerDashboard />
//           </RoleRoute>
//         ),
//       },
//       {
//         path: "dashboard/admin",
//         element: (
//           <RoleRoute allowedRoles={["admin"]}>
//             <AdminDashboard />
//           </RoleRoute>
//         ),
//       },

//       // DASHBOARD REDIRECT (fallback - redirects to role-specific dashboard)
//       {
//         path: "dashboard",
//         element: <DashboardRedirect />,
//       },

//       // ISSUES (ORDER IS CRITICAL!)
//       { path: "issues/new", element: <NewIssuePage /> },
//       { path: "issues/:id", element: <IssueDetailPage /> },
//       { path: "issues", element: <IssuesPage /> },

//       // FEEDBACK
//       { path: "feedback", element: <FeedbackPage /> },
//       { path: "feedback/my", element: <MyFeedback /> },

//       // REPORTS (Manager/Admin only)
//       {
//         path: "reports",
//         element: (
//           <RoleRoute allowedRoles={["manager", "admin"]}>
//             <ReportsPage />
//           </RoleRoute>
//         ),
//       },

//       // NOTIFICATIONS
//       { path: "notifications", element: <NotificationsPage /> },

//       // PROFILE
//       { path: "profile", element: <ProfilePage /> },
//       { path: "profile/edit", element: <ProfileEdit /> },
//       { path: "profile/view", element: <ProfileViewer /> },

//       // USERS (Admin only)
//       {
//         path: "users",
//         element: (
//           <RoleRoute allowedRoles={["admin"]}>
//             <UsersPage />
//           </RoleRoute>
//         ),
//       },
//     ],
//   },

//   // 404 PAGE
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
//             onClick={() => (window.location.href = "/login")}
//             className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-xl"
//           >
//             Go to Login
//           </button>
//         </div>
//       </div>
//     ),
//   },
// ]);

// export { router };

// routes/index.jsx - ADD THESE IMPORTS AND ROUTES
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

// ADMIN PAGES - ADD THESE IMPORTS
import UserManagement from "../pages/Admin/UserManagement"; 
import FeedbackAdmin from "../pages/Admin/FeedbackAdmin";
import FeedbackDetailPage from "../pages/Admin/FeedbackDetailPage"; 
import IssueHistoryPage from "../pages/Admin/IssueHistoryPage";
// import AttachmentsAdmin from "../pages/Admin/AttachmentsAdmin"; // For later use

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
    path: "/request-access",
    element: <RequestAccess />,
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

      // ADMIN PAGES SECTION - ADD THESE ROUTES
      {
        path: "admin/users",
        element: (
          <RoleRoute allowedRoles={["admin"]}>
            <UserManagement />
          </RoleRoute>
        ),
      },
      {
        path: "admin/feedback",
        element: (
          <RoleRoute allowedRoles={["admin"]}>
            <FeedbackAdmin />
          </RoleRoute>
        ),
      },
      {
        path: "admin/issue-history",
        element: (
          <RoleRoute allowedRoles={["admin", "manager"]}>
            <IssueHistoryPage />
          </RoleRoute>
        ),
      },
      {
        path: "admin/feedback/:id",
        element: (
          <RoleRoute allowedRoles={["admin"]}>
            <FeedbackDetailPage />
          </RoleRoute>
        ),
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

      // USERS (Admin only) - This is DIFFERENT from admin/users (it's your existing UsersPage)
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

export { router };