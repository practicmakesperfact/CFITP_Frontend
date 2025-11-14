// import axiosClient from "./axiosClient.js";
// import { setTokens, removeTokens } from "../utils/authHelper.js";

// export const authApi = {
//   register: (data) => axiosClient.post("/auth/register/", data),
//   login: async (credentials) => {
//     const res = await axiosClient.post("/auth/login/", credentials);
//     const { access, refresh } = res.data;
//     setTokens(access, refresh);
//     return res;
//   },
//   logout: () => {
//     removeTokens();
//     window.location.href = "/login";
//   },
//   me: () => axiosClient.get("/users/me/"),
//   refreshToken: (refresh) => axiosClient.post("/auth/refresh/", { refresh }),
// };


// src/api/authApi.js
import { setTokens, removeTokens } from "../utils/authHelper.js";

// Simulate network delay
const delay = (ms = 1200) => new Promise((res) => setTimeout(res, ms));

export const authApi = {
  register: async (data) => {
    await delay();

    const { email, password, first_name, last_name } = data;

    // Validation
    if (!email || !password || !first_name || !last_name) {
      throw new Error("All fields are required");
    }
    if (password.length < 6) {
      throw new Error("Password must be 6+ characters");
    }
    if (!email.includes("@")) {
      throw new Error("Invalid email");
    }

    // Check if user exists
    const existing = localStorage.getItem(`user_${email}`);
    if (existing) {
      throw new Error("Email already registered");
    }

    // Create user
    const user = {
      id: Date.now(),
      email,
      first_name,
      last_name,
      role: "client", // default
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(`user_${email}`, JSON.stringify(user));

    return { data: { message: "Registered successfully" } };
  },

  login: async (credentials) => {
    await delay();

    const { email, password } = credentials;

    const stored = localStorage.getItem(`user_${email}`);
    if (!stored) {
      throw new Error("Invalid email or password");
    }

    const user = JSON.parse(stored);

    // Simple password check (in real app: use hash)
    if (password !== "123456") {
      throw new Error("Invalid email or password");
    }

    // Fake tokens
    const access = `mock-access-${Date.now()}`;
    const refresh = `mock-refresh-${Date.now()}`;

    setTokens(access, refresh);
    localStorage.setItem("user_role", user.role);
    localStorage.setItem("user_profile", JSON.stringify(user));

    return { data: { access, refresh } };
  },

  me: async () => {
    await delay();
    const profile = localStorage.getItem("user_profile");
    if (!profile) throw new Error("Not logged in");
    return { data: JSON.parse(profile) };
  },

  logout: () => {
    removeTokens();
    window.location.href = "/login";
  },
};