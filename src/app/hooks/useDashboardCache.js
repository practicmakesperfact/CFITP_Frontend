
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const useDashboardCache = (currentRole) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentRole) return;

    // Define which caches to clear based on current role
    const cachesToClear = {
      client: [
        "staff-issues",
        "staff-users-dashboard",
        "manager-dashboard",
        "admin-dashboard",
      ],
      staff: [
        "issues-all",
        "manager-dashboard",
        "admin-dashboard",
        "client-dashboard",
      ],
      manager: ["staff-issues", "client-dashboard", "admin-dashboard"],
      admin: ["staff-issues", "client-dashboard", "manager-dashboard"],
    };

    // Clear other role's caches
    const roles = ["client", "staff", "manager", "admin"];
    roles.forEach((role) => {
      if (role !== currentRole) {
        cachesToClear[role]?.forEach((key) => {
          queryClient.removeQueries({ queryKey: [key] });
        });
      }
    });

    // Invalidate current role's queries to refresh
    queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey[0];
        return (
          typeof queryKey === "string" &&
          (queryKey.includes(currentRole) ||
            queryKey.includes("issues") ||
            queryKey.includes("dashboard"))
        );
      },
    });
  }, [currentRole, queryClient]);
};
