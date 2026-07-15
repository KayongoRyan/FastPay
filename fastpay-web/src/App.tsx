import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PricingPage } from "./pages/PricingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SecurityPage } from "./pages/SecurityPage";
import { ServicesPage } from "./pages/ServicesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignupPage } from "./pages/SignupPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
