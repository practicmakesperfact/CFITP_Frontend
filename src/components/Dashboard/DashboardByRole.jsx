
import { useUIStore } from "../../app/store/uiStore";
import ClientDashboard from "./ClientDashboard";
import StaffDashboard from "./StaffDashboard";
import ManagerDashboard from "./ManagerDashboard";
import AdminDashboard from "./AdminDashboard";

export default function DashboardByRole() {
  const userRole = useUIStore((state) => state.userRole);
  const storedRole = localStorage.getItem("user_role");
  const role = userRole || storedRole;

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
      return <ClientDashboard />;
  }
}
