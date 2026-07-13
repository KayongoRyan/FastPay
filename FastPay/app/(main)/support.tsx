import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname } from "expo-router";
import { MessageCircle, Shield, Wifi } from "lucide-react-native";

import { ChatInput } from "@/components/support/ChatInput";
import { ChatMessageList } from "@/components/support/ChatMessageList";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { BackHeader } from "@/components/ui/BackHeader";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { BudgetSnapshotPayload } from "@/lib/api/chat";
import { useAssistantEngagementStore } from "@/store/assistantEngagementStore";
import { useAssistantStore } from "@/store/assistantStore";
import { useBudgetStore } from "@/store/budgetStore";
import { useChatStore } from "@/store/chatStore";
import { useFamilyPlanStore } from "@/store/familyPlanStore";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export default function SupportScreen() {
  useHideTabBar();
  const { user } = useRequireAuth();

  const pathname = usePathname();
  const { messages, isLoading, error, sendMessage, clear } = useChatStore();
  const { budget, goals, initialize: initBudget } = useBudgetStore();
  const { settings, plans, initialize: initFamily } = useFamilyPlanStore();
  const {
    wallet,
    balanceRwfEstimate,
    balanceUsdtFormatted,
    cryptoPortfolio,
    nativeBalanceXlm,
    initialize: initWallet,
  } = useWalletStore();
  const { initialize: initEngagement } = useAssistantEngagementStore();
  const {
    privacyMode,
    modelStatus,
    modelMessage,
    useLocalLlm,
    initialize: initAssistant,
    downloadModel,
  } = useAssistantStore();

  const cryptoPortfolioSummary = useMemo(
    () =>
      cryptoPortfolio?.holdings
        .map((h) => `${h.amountFormatted} ${h.symbol}`)
        .join(", ") ?? "",
    [cryptoPortfolio],
  );

  useEffect(() => {
    void initBudget();
    void initFamily();
    void initWallet();
    void initAssistant();
    void initEngagement();
  }, [initBudget, initFamily, initWallet, initAssistant, initEngagement]);

  const budgetSnapshot = useMemo<BudgetSnapshotPayload>(
    () => {
      const savingsBucket = budget.buckets.find((bucket) =>
        /savings|save|goal/i.test(bucket.name),
      );
      const spendBuckets = budget.buckets.filter(
        (bucket) => bucket.id !== savingsBucket?.id,
      );

      return {
        monthlyIncomeRwf: budget.incomeBaseRwf,
        spendPercent: spendBuckets.reduce((sum, bucket) => sum + bucket.percent, 0),
        savingsPercent: savingsBucket?.percent,
        goals: goals.map((goal) => ({
          name: goal.name,
          targetRwf: goal.targetRwf,
          savedRwf: goal.savedRwf,
        })),
        familyPlan: {
          yearlyIncomePercent: settings.yearlyIncomePercent,
          children: plans.map((plan) => ({
            label: plan.name,
            lockYears: plan.lockYears,
            savedRwf: plan.savedRwf,
          })),
        },
      };
    },
    [budget, goals, settings, plans],
  );

  const modeLabel =
    privacyMode === "private" ? "Private · on-device" : "Connected · tools enabled";

  return (
    <TabScreenLayout
      adjustForKeyboard
      scroll
      footer={
        <ChatInput
          disabled={isLoading}
          onSend={(message) =>
            void sendMessage({
              message,
              currentRoute: pathname,
              budgetSnapshot,
              walletPublicKey: wallet?.publicKey,
              walletBalanceRwf: balanceRwfEstimate,
              walletBalanceXlm: nativeBalanceXlm,
              walletBalanceUsdt: balanceUsdtFormatted,
              cryptoPortfolioSummary,
              user,
            })
          }
        />
      }
    >
      <BackHeader title="AI Assistant" />
      <View style={styles.hero}>
        <MessageCircle size={22} color={colors.primary} />
        <Text style={styles.heroText}>
          Your financial copilot — tracks cash flow, learns your habits, and guides USDT, BTC, and SOL decisions.
        </Text>
      </View>

      <View style={styles.badges}>
        <View style={styles.badge}>
          {privacyMode === "private" ? (
            <Shield size={14} color={colors.success} />
          ) : (
            <Wifi size={14} color={colors.primary} />
          )}
          <Text style={styles.badgeText}>{modeLabel}</Text>
        </View>
        {useLocalLlm ? (
          <View style={styles.badgeMuted}>
            <Text style={styles.badgeMutedText}>
              {modelStatus === "ready"
                ? "LLM ready"
                : modelStatus === "downloading"
                  ? "Downloading model…"
                  : modelStatus === "unsupported"
                    ? "Template mode"
                    : "Local LLM"}
            </Text>
          </View>
        ) : null}
      </View>

      {modelStatus === "unsupported" && useLocalLlm ? (
        <Pressable style={styles.modelCta} onPress={() => void downloadModel()}>
          <Text style={styles.modelCtaText}>
            Download on-device model (web: WebLLM · mobile: dev build)
          </Text>
        </Pressable>
      ) : null}

      {modelMessage ? <Text style={styles.modelNote}>{modelMessage}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ChatMessageList messages={messages} />

      {messages.length > 0 ? (
        <Pressable style={styles.clearBtn} onPress={clear}>
          <Text style={styles.clearText}>Clear conversation</Text>
        </Pressable>
      ) : null}
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroText: {
    flex: 1,
    color: colors.textMuted,
    lineHeight: 20,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  badgeMuted: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.pillTrack,
  },
  badgeMutedText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  modelCta: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  modelCtaText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  modelNote: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
  },
  clearBtn: {
    alignSelf: "center",
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
