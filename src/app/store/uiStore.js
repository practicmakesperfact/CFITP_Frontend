
// import { create } from "zustand";

// export const useUIStore = create((set) => ({
//   darkMode: localStorage.getItem("darkMode") === "true",
//   sidebarOpen: true,
//   userRole: localStorage.getItem("user_role") || "client", // ← NEW

//   toggleDarkMode: () =>
//     set((state) => {
//       const newMode = !state.darkMode;
//       localStorage.setItem("darkMode", newMode);
//       if (newMode) document.documentElement.classList.add("dark");
//       else document.documentElement.classList.remove("dark");
//       return { darkMode: newMode };
//     }),

//   toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

//   setUserRole: (role) => set({ userRole: role }), // ← NEW
// }));



import { create } from 'zustand';

export const useUIStore = create((set) => ({
  userRole: localStorage.getItem('user_role') || null,
  userProfile: JSON.parse(localStorage.getItem('user_profile') || 'null'),
  darkMode: false,
  sidebarOpen: true,
  loading: false,  // ADD THIS
  setLoading: (loading) => set({ loading }),  // ADD THIS

  setUserRole: (role) => {
    localStorage.setItem('user_role', role);
    set({ userRole: role });
  },

  setUserProfile: (profile) => {
    localStorage.setItem('user_profile', JSON.stringify(profile));
    set({ userProfile: profile });
  },

  clearAuth: () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_profile');
    set({ userRole: null, userProfile: null });
  },

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));