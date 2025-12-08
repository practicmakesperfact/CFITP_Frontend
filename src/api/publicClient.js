// src/api/publicClient.js
import axios from "axios";

// Axios instance for public routes (no auth token)
const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicClient;
