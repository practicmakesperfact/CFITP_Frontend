import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.jsx";
import { useEffect } from "react";
import { useUIStore } from "./app/store/uiStore.js";

export default function App() {
  const { darkMode } = useUIStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <>
    
      <RouterProvider router={router} />
    </>
  );
}
