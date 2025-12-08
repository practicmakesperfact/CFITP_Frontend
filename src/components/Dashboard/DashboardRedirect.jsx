
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useUIStore } from "../../app/store/uiStore";
// import { Loader2 } from "lucide-react";

// export default function DashboardRedirect() {
//   const navigate = useNavigate();
//   const userRole = useUIStore((state) => state.userRole);

//   useEffect(() => {
//     // Get role from localStorage if Zustand hasn't loaded yet
//     const storedRole = localStorage.getItem("user_role");
//     const role = userRole || storedRole;

//     if (!role) {
//       navigate("/login");
//       return;
//     }

//     // Redirect based on role
//     switch (role) {
//       case "client":
//         navigate("/dashboard/client");
//         break;
//       case "staff":
//         navigate("/dashboard/staff");
//         break;
//       case "manager":
//         navigate("/dashboard/manager");
//         break;
//       case "admin":
//         navigate("/dashboard/admin");
//         break;
//       default:
//         navigate("/login");
//     }
//   }, [navigate, userRole]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-orange-50">
//       <div className="text-center">
//         <Loader2
//           className="animate-spin text-teal-600 mx-auto mb-4"
//           size={48}
//         />
//         <p className="text-gray-600">Redirecting to your dashboard...</p>
//       </div>
//     </div>
//   );
// }

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "../../app/store/uiStore";
import { authApi } from "../../api/authApi";

export default function DashboardRedirect() {
  const navigate = useNavigate();
  const setUserRole = useUIStore((state) => state.setUserRole);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.me();
        const user = res.data;

        setUserRole(user.role);
        localStorage.setItem("user_role", user.role);
        localStorage.setItem("user_profile", JSON.stringify(user));

        // redirect to correct dashboard
        navigate(`/app/dashboard/ ${user.role}`, { replace: true });
      } catch (err) {
        console.error("Auth failed", err);
        navigate("/login", { replace: true });
      }
    };

    fetchUser();
  }, [navigate, setUserRole]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}
