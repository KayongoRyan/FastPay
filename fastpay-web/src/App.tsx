import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthLayout } from "./components/AuthLayout";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { ContactPage } from "./pages/ContactPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PinSetupPage } from "./pages/PinSetupPage";
import { PricingPage } from "./pages/PricingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SecurityPage } from "./pages/SecurityPage";
import { ServicesPage } from "./pages/ServicesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignupPage } from "./pages/SignupPage";
import { AppAnalyticsPage } from "./pages/app/AppAnalyticsPage";
import { AppBillsPage } from "./pages/app/AppBillsPage";
import { AppBuyPage } from "./pages/app/AppBuyPage";
import { AppConvertPage } from "./pages/app/AppConvertPage";
import { AppHomePage } from "./pages/app/AppHomePage";
import { AppReceivePage } from "./pages/app/AppReceivePage";
import { AppSecurityPage } from "./pages/app/AppSecurityPage";
import { AppSubscriptionsPage } from "./pages/app/AppSubscriptionsPage";
import { AppTransferPage } from "./pages/app/AppTransferPage";
import { AppWalletPage } from "./pages/app/AppWalletPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Marketing site — guests only; Layout bounces signed-in users to /app */}
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="pin-setup" element={<PinSetupPage />} />
          </Route>

          {/* Wallet app — replaces the site once signed in with a PIN */}
          <Route path="app" element={<AppShell />}>
            <Route index element={<AppHomePage />} />
            <Route path="wallet" element={<AppWalletPage />} />
            <Route path="transfer" element={<AppTransferPage />} />
            <Route path="receive" element={<AppReceivePage />} />
            <Route path="buy" element={<AppBuyPage />} />
            <Route path="convert" element={<AppConvertPage />} />
            <Route path="analytics" element={<AppAnalyticsPage />} />
            <Route path="bills" element={<AppBillsPage />} />
            <Route path="subscriptions" element={<AppSubscriptionsPage />} />
            <Route path="security" element={<AppSecurityPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Legacy account routes */}
          <Route path="profile" element={<Navigate to="/app/profile" replace />} />
          <Route path="settings" element={<Navigate to="/app/settings" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
