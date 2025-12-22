
import { Outlet } from "react-router-dom";
import HomeNavbar from "./HomeNavbar";
import HomeFooter from "./HomeFooter";

export default function HomeLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <HomeFooter />
    </div>
  );
}