import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileActionBar from "@/components/MobileActionBar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-obsidian text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileActionBar />
      <div className="lg:hidden h-14" aria-hidden />
    </div>
  );
}