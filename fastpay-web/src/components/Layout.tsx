import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout() {
  const { ready, isAuthenticated } = useAuth();

  // Signed-in users live in the wallet app, not the marketing site.
  if (ready && isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <>
      <TopBar />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
