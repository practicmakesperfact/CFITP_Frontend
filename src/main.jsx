// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "./styles/tailwind.css";
import "./styles/globals.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./app/queryClient.js";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#334155",
            color: "#fff",
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
