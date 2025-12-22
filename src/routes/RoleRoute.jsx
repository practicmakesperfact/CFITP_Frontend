
import { Navigate } from "react-router-dom";
import { useUIStore } from "../app/store/uiStore";

export default function RoleRoute({ children, allowedRoles }) {
  const userRole = useUIStore((state) => state.userRole);
  const storedRole = localStorage.getItem("user_role");

  const currentRole = userRole || storedRole;

  if (!currentRole) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    // Return unauthorized message
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50 p-4">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-10">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H8m13-4a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Restricted
          </h2>
          <p className="text-gray-600 mb-4">
            You need{" "}
            <span className="font-semibold">{allowedRoles.join(" or ")}</span>
            privileges to access this page.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Your current role:{" "}
            <span className="font-medium capitalize">{currentRole}</span>
          </p>
          <button
            onClick={() => (window.location.href = `/dashboard/${currentRole}`)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-xl"
          >
            Go to Your Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
