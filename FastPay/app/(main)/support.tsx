import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname } from "expo-router";
import { MessageCircle } from "lucide-react-native";

import { ChatInput } from "@/components/support/ChatInput";
import { ChatMessageList } from "@/components/support/ChatMessageList";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { BackHeader } from "@/components/ui/BackHeader";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { BudgetSnapshotPayload } from "@/lib/api/chat";
import { useBudgetStore } from "@/store/budgetStore";
import { useChatStore } from "@/store/chatStore";
import { useFamilyPlanStore } from "@/store/familyPlanStore";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function SupportScreen() {
  useHideTabBar();
  useRequireAuth();

  const pathname = usePathname();
  const { messages, isLoading, error, sendMessage, clear } = useChatStore();
  const { budget, goals, initialize: initBudget } = useBudgetStore();
  const { settings, plans, initialize: initFamily } = useFamilyPlanStore();
  const { wallet, initialize: initWallet } = useWalletStore();

  useEffect(() => {
    void initBudget();
    void initFamily();
    void initWallet();
  }, [initBudget, initFamily, initWallet]);

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
          deadline: goal.deadline,
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
            })
          }
        />
      }
    >
      <BackHeader title="Ask FastPay" />
      <View style={styles.hero}>
        <MessageCircle size={22} color={colors.primary} />
        <Text style={styles.heroText}>
          Product help grounded in FastPay docs, your payments, and budget snapshot.
        </Text>
      </View>

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
    marginBottom: spacing.md,
  },
  heroText: {
    flex: 1,
    color: colors.textMuted,
    lineHeight: 20,
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
