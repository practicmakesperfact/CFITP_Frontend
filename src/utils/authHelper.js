import { performLogout } from "./logoutHelper";

export const setTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);

  // Also set a timestamp for token age tracking
  localStorage.setItem("token_timestamp", Date.now().toString());
};

export const removeTokens = () => {
  performLogout({ showToast: false, silent: true });
};

export const getRefreshToken = () => localStorage.getItem("refresh_token");

export const isAuthenticated = () => {
  const token = localStorage.getItem("access_token");
  if (!token || token.startsWith("demo-")) return false;

  // Optional: Check token age (if you want to implement client-side expiry)
  const tokenTimestamp = localStorage.getItem("token_timestamp");
  if (tokenTimestamp) {
    const age = Date.now() - parseInt(tokenTimestamp);
    const maxAge = 14 * 24 * 60 * 60 * 1000; // 14 days max
    if (age > maxAge) {
      console.warn("Token too old, forcing logout");
      performLogout({ silent: true });
      return false;
    }
  }

  return true;
};

// Token age utility
export const getTokenAge = () => {
  const timestamp = localStorage.getItem("token_timestamp");
  if (!timestamp) return null;

  const age = Date.now() - parseInt(timestamp);
  const minutes = Math.floor(age / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return { age, minutes, hours, days };
};
