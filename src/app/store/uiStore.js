
import { create } from "zustand";

export const useUIStore = create((set) => ({
  darkMode: localStorage.getItem("darkMode") === "true",
  sidebarOpen: true,
  userRole: localStorage.getItem("user_role") || "client", // ← NEW

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode;
      localStorage.setItem("darkMode", newMode);
      if (newMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return { darkMode: newMode };
    }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setUserRole: (role) => set({ userRole: role }), // ← NEW
}));
