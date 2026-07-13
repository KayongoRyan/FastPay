import { Href, router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import {
  BarChart3,
  Bell,
  Bot,
  Cloud,
  CreditCard,
  FileText,
  Fingerprint,
  Globe2,
  KeyRound,
  Languages,
  LifeBuoy,
  Lock,
  LogOut,
  Receipt,
  Shield,
  Smartphone,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react-native";
import Constants from "expo-constants";

import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import {
  SettingsInfoRow,
  SettingsNavRow,
  SettingsProfileHeader,
  SettingsSection,
  SettingsToggleRow,
} from "@/components/settings";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { loadTransactionPin } from "@/lib/auth/storage";
import { getApiUrl } from "@/lib/api/client";
import { featureRoutes } from "@/lib/navigation/feature-routes";
import {
  formatKycStatus,
  getLoginMethodLabel,
  maskPhone,
  truncateId,
} from "@/lib/settings/profile";
import { useAuthStore } from "@/store/authStore";
import { useAssistantStore } from "@/store/assistantStore";
import { useChatStore } from "@/store/chatStore";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

function showComingSoon(feature: string) {
  Alert.alert("Coming soon", `${feature} will be available in a future update.`);
}

export default function SettingsScreen() {
  const { user, isReady, isLoading } = useRequireAuth();
  const {
    logout,
    enableBiometric,
    disableBiometric,
    biometricLabel,
    isLoading: authBusy,
    error,
  } = useAuthStore();
  const wallet = useWalletStore((state) => state.wallet);
  const clearChat = useChatStore((state) => state.clear);
  const {
    privacyMode,
    cloudFallback,
    useLocalLlm,
    modelStatus,
    modelMessage,
    initialize: initAssistant,
    setPrivacyMode,
    setCloudFallback,
    setUseLocalLlm,
    downloadModel,
  } = useAssistantStore();

  const [hasTransactionPin, setHasTransactionPin] = useState<boolean | null>(null);

  useEffect(() => {
    void loadTransactionPin().then((pin) => setHasTransactionPin(Boolean(pin)));
    void initAssistant();
  }, [initAssistant]);

  const handleBiometricToggle = useCallback(
    (enabled: boolean) => {
      if (authBusy) {
        return;
      }
      void (enabled ? enableBiometric() : disableBiometric());
    },
    [authBusy, disableBiometric, enableBiometric],
  );

  if (!isReady || isLoading || !user) {
    return (
      <TabScreenLayout scroll={false}>
        <Text style={styles.muted}>Loading...</Text>
      </TabScreenLayout>
    );
  }

  const transactionPinLabel =
    hasTransactionPin === null
      ? "Checking…"
      : hasTransactionPin
        ? "4-digit passcode set"
        : "Not set yet";

  return (
    <TabScreenLayout>
      <Text style={styles.pageTitle}>Settings</Text>
      <Text style={styles.pageSubtitle}>
        Manage your account, security, and app preferences
      </Text>

      <SettingsProfileHeader user={user} />

      <SettingsSection
        title="Account information"
        description="Details from your sign-up and login"
      >
        <SettingsInfoRow label="Full name" value={user.fullName} />
        <SettingsInfoRow
          label="Email"
          value={user.email?.trim() || "Not provided"}
        />
        <SettingsInfoRow
          label="Phone"
          value={
            user.phone
              ? maskPhone(user.phone)
              : "Not provided — add during KYC or profile update"
          }
        />
        <SettingsInfoRow
          label="Login method"
          value={getLoginMethodLabel(user)}
        />
        <SettingsInfoRow
          label="Account ID"
          value={truncateId(user.id, 12)}
          mono
        />
        <SettingsInfoRow
          label="KYC level"
          value={`Level ${user.kycLevel} · ${formatKycStatus(user.kycStatus)}`}
          isLast
        />
      </SettingsSection>

      <SettingsSection
        title="Security"
        description="Protect your account and payments"
      >
        <SettingsToggleRow
          icon={Fingerprint}
          title={biometricLabel}
          subtitle={
            user.biometricEnabled
              ? `Unlock FastPay with ${biometricLabel}`
              : `Use ${biometricLabel} instead of typing your password`
          }
          value={user.biometricEnabled}
          onValueChange={handleBiometricToggle}
          disabled={authBusy}
          loading={authBusy}
        />
        <SettingsNavRow
          icon={KeyRound}
          title="Reset transaction passcode"
          subtitle={transactionPinLabel}
          onPress={() => router.push(featureRoutes.forgotPasscode("/settings"))}
        />
        <SettingsNavRow
          icon={Lock}
          title="Change login password"
          subtitle="Update the password you use to sign in"
          badge="Soon"
          onPress={() => showComingSoon("Change login password")}
        />
        <SettingsNavRow
          icon={Shield}
          title="Identity verification (KYC)"
          subtitle={`${formatKycStatus(user.kycStatus)} · upload ID & proof of address`}
          onPress={() => router.push(featureRoutes.kyc)}
          isLast
        />
      </SettingsSection>

      <SettingsSection
        title="Wallet & payments"
        description="Linked accounts and payment tools"
      >
        <SettingsNavRow
          icon={Wallet}
          title="Stellar wallet"
          subtitle={
            wallet
              ? `${truncateId(wallet.publicKey, 10)} · view balance & transfers`
              : "Create or link your on-chain wallet"
          }
          onPress={() => router.push(featureRoutes.wallet)}
        />
        <SettingsNavRow
          icon={Smartphone}
          title="Mobile money numbers"
          subtitle="MTN MoMo & Airtel Money for top-ups"
          onPress={() => router.push(featureRoutes.buy())}
        />
        <SettingsNavRow
          icon={CreditCard}
          title="Virtual cards"
          subtitle="Manage FastPay card tiers and subscriptions"
          onPress={() => router.push(featureRoutes.wallet)}
        />
        <SettingsNavRow
          icon={Receipt}
          title="Bills & recurring payments"
          subtitle="Track utilities, rent, and subscriptions"
          onPress={() => router.push(featureRoutes.bills())}
        />
        <SettingsNavRow
          icon={WifiOff}
          title="Offline payments"
          subtitle="Send and receive without internet"
          onPress={() => router.push(featureRoutes.offlineReceive)}
          isLast
        />
      </SettingsSection>

      <SettingsSection
        title="Family & planning"
        description="Household and money goals"
      >
        <SettingsNavRow
          icon={Users}
          title="Family wallet"
          subtitle="Shared accounts, limits, and approvals"
          onPress={() => router.push(featureRoutes.familySetup)}
        />
        <SettingsNavRow
          icon={BarChart3}
          title="Budget & savings goals"
          subtitle="Weekly plan, goals, and analytics"
          onPress={() => router.push(featureRoutes.analytics())}
          isLast
        />
      </SettingsSection>

      <SettingsSection
        title="Assistant"
        description="Offline-first AI — Private keeps all data on this device"
      >
        <SettingsNavRow
          icon={Shield}
          title="Privacy mode"
          subtitle={
            privacyMode === "private"
              ? "Private — no external fetch, no cloud assistant"
              : "Connected — FX, Horizon, and bundled gov FAQs allowed"
          }
          onPress={() =>
            void setPrivacyMode(privacyMode === "private" ? "connected" : "private")
          }
        />
        <SettingsToggleRow
          icon={Cloud}
          title="Cloud assistant fallback"
          subtitle="Use server RAG when local docs are insufficient (Connected only)"
          value={cloudFallback}
          onValueChange={(next) => void setCloudFallback(next)}
          disabled={privacyMode === "private"}
        />
        <SettingsToggleRow
          icon={Bot}
          title="On-device LLM"
          subtitle={
            modelStatus === "ready"
              ? "Neural answers on this device"
              : modelStatus === "unsupported"
                ? "Using fast templates + local search"
                : `Model: ${modelStatus}`
          }
          value={useLocalLlm}
          onValueChange={(next) => void setUseLocalLlm(next)}
        />
        <SettingsNavRow
          icon={Bot}
          title="Download / refresh model"
          subtitle={modelMessage ?? "WebLLM on browser · llama.rn on dev build"}
          onPress={() => void downloadModel()}
        />
        <SettingsNavRow
          icon={LifeBuoy}
          title="Clear assistant chat"
          subtitle="Remove local conversation history"
          onPress={clearChat}
          isLast
        />
      </SettingsSection>

      <SettingsSection
        title="Preferences"
        description="Customize how FastPay works for you"
      >
        <SettingsNavRow
          icon={Bell}
          title="Notifications"
          subtitle="Payment alerts, security, and promotions"
          badge="Soon"
          onPress={() => showComingSoon("Notification preferences")}
        />
        <SettingsNavRow
          icon={Languages}
          title="Language & region"
          subtitle="English · Rwanda (RWF)"
          badge="Soon"
          onPress={() => showComingSoon("Language and region settings")}
        />
        <SettingsNavRow
          icon={Globe2}
          title="Privacy & data"
          subtitle="Hide balances, export data, marketing consent"
          badge="Soon"
          onPress={() => showComingSoon("Privacy and data controls")}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="Support & legal">
        <SettingsNavRow
          icon={LifeBuoy}
          title="Help & Assistant"
          subtitle="Ask FastPay about features, payments, and KYC"
          onPress={() => router.push(featureRoutes.support)}
        />
        <SettingsNavRow
          icon={FileText}
          title="Terms of service"
          badge="Soon"
          onPress={() => showComingSoon("Terms of service")}
        />
        <SettingsNavRow
          icon={Shield}
          title="Privacy policy"
          badge="Soon"
          onPress={() => showComingSoon("Privacy policy")}
          isLast
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsInfoRow label="App version" value={APP_VERSION} />
        <SettingsInfoRow label="API environment" value={getApiUrl()} mono isLast />
      </SettingsSection>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.signOutBtn, authBusy && styles.disabled]}
        disabled={authBusy}
        onPress={() => void logout().then(() => router.replace("/login" as Href))}
      >
        <LogOut color={colors.error} size={18} />
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <View style={styles.footerSpace} />
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted },
  pageTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.45)",
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: "rgba(248,113,113,0.08)",
  },
  signOutText: {
    color: colors.error,
    fontWeight: "700",
    fontSize: 15,
  },
  disabled: { opacity: 0.5 },
  footerSpace: { height: spacing.md },
});
