
import { create } from 'zustand';

export const useUIStore = create((set) => ({
  userRole: localStorage.getItem('user_role') || null,
  userProfile: JSON.parse(localStorage.getItem('user_profile') || 'null'),
  darkMode: false,
  sidebarOpen: true,
  loading: false,  
  setLoading: (loading) => set({ loading }),  

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