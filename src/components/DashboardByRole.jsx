
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import ClientDashboard from "../pages/Dashboards/ClientDashboard.jsx";
import StaffDashboard from "../pages/Dashboards/StaffDashboard.jsx";
import ManagerDashboard from "../pages/Dashboards/ManagerDashboard.jsx";
import AdminDashboard from "../pages/Dashboards/AdminDashboard.jsx";

export default function DashboardByRole() {
  const [role, setRole] = useState(localStorage.getItem("user_role"));

  useEffect(() => {
    const updateRole = () => {
      setRole(localStorage.getItem("user_role"));
    };

    // Initial check
    updateRole();

    // Listen for manual trigger from login
    window.addEventListener("roleChanged", updateRole);
    // Listen for changes from other tabs
    window.addEventListener("storage", updateRole);

    return () => {
      window.removeEventListener("roleChanged", updateRole);
      window.removeEventListener("storage", updateRole);
    };
  }, []); // ← Only once

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "staff":
      return <StaffDashboard />;
    case "client":
    default:
      return <ClientDashboard />;
  }
}
