import { useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGuestPageMotion } from "../hooks/useGuestPageMotion";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout() {
  const { ready, isAuthenticated } = useAuth();
  const mainRef = useRef<HTMLElement>(null);

  useGuestPageMotion(mainRef);

  // Signed-in users live in the wallet app, not the marketing site.
  if (ready && isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <>
      <TopBar />
      <Navbar />
      <main ref={mainRef}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
