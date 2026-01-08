// src/utils/logoutHelper.js - UPDATED VERSION
import { queryClient } from "../app/queryClient";
import { authApi } from "../api/authApi";
import toast from "react-hot-toast";

// ============================================
// 1. COMPREHENSIVE CACHE CLEARING FUNCTION
// ============================================
export const clearAllDashboardCaches = () => {
  console.log("🧹 [CACHE] Clearing ALL dashboard caches...");

  // Method 1: Clear ALL queries using clear()
  queryClient.clear();

  // Method 2: Remove ALL queries by emptying the cache
  queryClient.removeQueries();

  // Method 3: Direct cache manipulation for stubborn queries
  const cache = queryClient.getQueryCache();
  const allQueries = cache.findAll();

  console.log(`🔍 [CACHE] Found ${allQueries.length} queries in cache`);

  // Remove ALL queries (nuclear option)
  allQueries.forEach((query) => {
    cache.remove(query);
  });

  // Method 4: Reset query client to default state
  queryClient.resetQueries();

  // Method 5: Clear mutation cache too
  const mutationCache = queryClient.getMutationCache();
  mutationCache.clear();

  console.log("✅ [CACHE] All caches cleared");
};

// ============================================
// 2. SPECIFIC QUERY KEY CLEARING
// ============================================
const queryKeysToClear = [
  // User & Auth
  "user-profile",
  "user",
  "users",
  "me",

  // Issues
  "issues",
  "issues-all",
  "staff-issues",
  "manager-issues",
  "admin-issues",
  "client-issues",
  "unassigned-issues",
  "assigned-issues",

  // Staff & Users
  "staff",
  "staff-users",
  "staff-users-dashboard",
  "clients",

  // Dashboards
  "dashboard",
  "client-dashboard",
  "staff-dashboard",
  "manager-dashboard",
  "admin-dashboard",

  // Other data
  "notifications",
  "reports",
  "feedback",
  "comments",
  "attachments",
  "activity",

  // Wildcard patterns (will match partial)
  "issues-",
  "user-",
  "dashboard-",
  "staff-",
  "client-",
  "manager-",
  "admin-",
];

// ============================================
// 3. MAIN LOGOUT FUNCTION
// ============================================
export const performLogout = async (options = {}) => {
  const {
    showToast = true,
    redirectToLogin = true,
    clearCache = true,
    silent = false,
    force = false, // Force logout even if errors
  } = options;

  try {
    if (!silent) {
      console.log("🔒 [LOGOUT] Performing comprehensive logout cleanup...");
    }

    // ==================== STEP 1: CLEAR REACT QUERY CACHE ====================
    if (clearCache) {
      clearAllDashboardCaches();

      // Additional targeted clearing by query key
      queryKeysToClear.forEach((key) => {
        try {
          queryClient.removeQueries({ queryKey: [key] });
          queryClient.invalidateQueries({ queryKey: [key] });
        } catch (e) {
          // Ignore errors for individual keys
        }
      });

      // Clear any query that matches our patterns
      const cache = queryClient.getQueryCache();
      const allQueries = cache.findAll();

      allQueries.forEach((query) => {
        try {
          const queryKey = query.queryKey;
          if (Array.isArray(queryKey) && queryKey.length > 0) {
            const firstKey = queryKey[0];
            if (typeof firstKey === "string") {
              // Check if this is a dashboard or role-related query
              const isDashboardQuery =
                firstKey.includes("dashboard") ||
                firstKey.includes("issues") ||
                firstKey.includes("staff") ||
                firstKey.includes("manager") ||
                firstKey.includes("admin") ||
                firstKey.includes("client");

              if (isDashboardQuery) {
                cache.remove(query);
              }
            }
          }
        } catch (e) {
          // Ignore errors for individual queries
        }
      });
    }

    // ==================== STEP 2: BACKEND LOGOUT (OPTIONAL) ====================
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken && !refreshToken.startsWith("demo")) {
      try {
        // Call backend logout but don't wait too long
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 3000)
        );

        await Promise.race([authApi.logout(), timeoutPromise]);

        if (!silent) {
          console.log("✅ [LOGOUT] Backend logout successful");
        }
      } catch (error) {
        if (!silent) {
          console.warn("⚠️ [LOGOUT] Backend logout had issue:", error.message);
        }
        // Continue with frontend cleanup even if backend fails
      }
    }

    // ==================== STEP 3: CLEAR ALL LOCAL STORAGE ====================
    try {
      // Preserve some items if needed (like theme preference)
      const itemsToKeep = ["theme"]; // Add items you want to preserve

      // Clear localStorage
      Object.keys(localStorage).forEach((key) => {
        if (!itemsToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      if (!silent) {
        console.log("✅ [LOGOUT] localStorage cleared");
      }
    } catch (e) {
      if (!silent) {
        console.warn("⚠️ [LOGOUT] Error clearing localStorage:", e.message);
      }
    }

    // ==================== STEP 4: CLEAR SESSION STORAGE ====================
    try {
      sessionStorage.clear();
      if (!silent) {
        console.log("✅ [LOGOUT] sessionStorage cleared");
      }
    } catch (e) {
      if (!silent) {
        console.warn("⚠️ [LOGOUT] Error clearing sessionStorage:", e.message);
      }
    }

    // ==================== STEP 5: CLEAR COOKIES ====================
    try {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(
            /=.*/,
            "=;expires=" +
              new Date().toUTCString() +
              ";path=/;domain=" +
              window.location.hostname
          );
      });

      if (!silent) {
        console.log("✅ [LOGOUT] Cookies cleared");
      }
    } catch (e) {
      if (!silent) {
        console.warn("⚠️ [LOGOUT] Error clearing cookies:", e.message);
      }
    }

    // ==================== STEP 6: CLEAR INDEXEDDB (IF USED) ====================
    try {
      if ("indexedDB" in window) {
        const databases = await window.indexedDB.databases();
        databases.forEach((db) => {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
        console.log("✅ [LOGOUT] IndexedDB cleared");
      }
    } catch (e) {
      if (!silent) {
        console.warn("⚠️ [LOGOUT] Error clearing IndexedDB:", e.message);
      }
    }

    // ==================== STEP 7: CLEAR SERVICE WORKER CACHE ====================
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
        console.log("✅ [LOGOUT] Service Worker caches cleared");
      }
    } catch (e) {
      if (!silent) {
        console.warn("⚠️ [LOGOUT] Error clearing caches:", e.message);
      }
    }

    // ==================== STEP 8: SHOW TOAST NOTIFICATION ====================
    if (showToast && !silent) {
      toast.success("Logged out successfully");
    }

    // ==================== STEP 9: REDIRECT TO LOGIN ====================
    if (redirectToLogin) {
      // Add cache-busting parameters
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);

      // Force hard redirect with cache busting
      setTimeout(() => {
        const loginUrl = `/login?t=${timestamp}&r=${random}&logout=true&cache=no`;

        // Use replace to prevent back button issues
        if (force) {
          // Nuclear option: Clear history
          window.location.replace(loginUrl);
        } else {
          window.location.href = loginUrl;
        }
      }, 150); // Small delay to ensure cleanup completes
    }

    // ==================== STEP 10: DISPATCH LOGOUT EVENT ====================
    // Notify other tabs/windows about logout
    try {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "logout_event",
          newValue: Date.now().toString(),
          url: window.location.href,
        })
      );

      // Also dispatch custom event
      window.dispatchEvent(new CustomEvent("user-logout"));
    } catch (e) {
      // Ignore event dispatch errors
    }

    return true;
  } catch (error) {
    console.error("❌ [LOGOUT] Logout cleanup error:", error);

    if (!silent && showToast) {
      toast.error("Logout failed. Please try again.");
    }

    // EMERGENCY CLEANUP - Force clear everything
    try {
      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();
      queryClient.removeQueries();
      queryClient.getQueryCache().clear();
    } catch (e) {
      console.error("❌ [LOGOUT] Emergency cleanup failed:", e);
    }

    if (redirectToLogin || force) {
      // Emergency redirect
      const timestamp = Date.now();
      window.location.href = `/login?emergency=${timestamp}&force=1`;
    }

    return false;
  }
};

// ============================================
// 4. UTILITY FUNCTIONS
// ============================================

// Utility to check if user is logged in
export const isLoggedIn = () => {
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("user_role");

  // Check both token and role exist
  if (!token || !userRole) {
    return false;
  }

  // Check token is not demo
  if (token.startsWith("demo-")) {
    return false;
  }

  // Optional: Check token age (if implemented)
  const tokenTimestamp = localStorage.getItem("token_timestamp");
  if (tokenTimestamp) {
    const age = Date.now() - parseInt(tokenTimestamp);
    const maxAge = 14 * 24 * 60 * 60 * 1000; // 14 days max
    if (age > maxAge) {
      console.warn("[AUTH] Token too old");
      performLogout({ silent: true, showToast: false });
      return false;
    }
  }

  return true;
};

// Utility to get current user role
export const getCurrentUserRole = () => {
  return localStorage.getItem("user_role");
};

// Utility to get current user profile
export const getCurrentUserProfile = () => {
  try {
    const profile = localStorage.getItem("user_profile");
    return profile ? JSON.parse(profile) : null;
  } catch (e) {
    return null;
  }
};

// Utility to clear specific role caches
export const clearRoleCaches = (roleToKeep) => {
  console.log(`🧹 [CACHE] Clearing caches for all roles except ${roleToKeep}`);

  const roles = ["client", "staff", "manager", "admin"];
  const cache = queryClient.getQueryCache();
  const allQueries = cache.findAll();

  allQueries.forEach((query) => {
    try {
      const queryKey = query.queryKey;
      if (Array.isArray(queryKey) && queryKey.length > 0) {
        const firstKey = queryKey[0];
        if (typeof firstKey === "string") {
          // Check which role this query belongs to
          roles.forEach((role) => {
            if (role !== roleToKeep && firstKey.includes(role)) {
              cache.remove(query);
              console.log(`🗑️ Removed ${role} query: ${firstKey}`);
            }
          });
        }
      }
    } catch (e) {
      // Ignore errors
    }
  });
};

// Listen for logout events from other tabs/windows
export const setupLogoutListener = () => {
  const handleStorageChange = (e) => {
    if (e.key === "access_token" && !e.newValue) {
      // Access token was removed (logout from another tab)
      console.log("[TAB SYNC] Logout detected from another tab");
      performLogout({ silent: true, showToast: false });
    }

    if (e.key === "logout_event") {
      // Custom logout event
      console.log("[TAB SYNC] Logout event received");
      performLogout({ silent: true, showToast: false });
    }
  };

  const handleCustomEvent = (e) => {
    if (e.type === "user-logout") {
      console.log("[EVENT] Custom logout event received");
      performLogout({ silent: true, showToast: false });
    }
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("user-logout", handleCustomEvent);

  // Return cleanup function
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("user-logout", handleCustomEvent);
  };
};

// ============================================
// 5. EXPORT ALL FUNCTIONS
// ============================================
export default {
  performLogout,
  clearAllDashboardCaches,
  clearRoleCaches,
  isLoggedIn,
  getCurrentUserRole,
  getCurrentUserProfile,
  setupLogoutListener,
};
