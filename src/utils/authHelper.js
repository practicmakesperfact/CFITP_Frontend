export const setTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};

export const getAccessToken = () => localStorage.getItem("access_token");
export const get984RefreshToken = () => localStorage.getItem("refresh_token");

export const removeTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_profile");
};

export const isAuthenticated = () => !!getAccessToken();
