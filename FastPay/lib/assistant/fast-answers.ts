import { featureRoutes } from "@/lib/navigation/feature-routes";
import { formatKycStatus } from "@/lib/settings/profile";

import type { AssistantContext, AssistantIntent, AssistantReply } from "./types";

function reply(
  partial: Omit<AssistantReply, "source" | "latencyMs" | "usedLlm" | "usedTools">,
  started: number,
): AssistantReply {
  return {
    ...partial,
    source: "local",
    latencyMs: Date.now() - started,
    usedLlm: false,
    usedTools: [],
  };
}

export function tryFastAnswer(
  intent: AssistantIntent,
  message: string,
  context: AssistantContext,
): AssistantReply | null {
  const started = Date.now();
  const lower = message.toLowerCase();

  if (intent === "balance" || /\b(wallet address|public key|btc|sol|usdt)\b/i.test(lower)) {
    if (!context.walletPublicKey) {
      return reply(
        {
          reply:
            "You do not have a wallet loaded yet. Open Wallet to create your USDT, BTC, and SOL portfolio.",
          sources: [{ title: "Wallet", source: "local/wallet" }],
          actions: [{ label: "Open Wallet", href: "/wallet" }],
          intent: "balance",
        },
        started,
      );
    }

    const balanceLine = context.walletBalanceUsdt
      ? `Portfolio: ${context.walletBalanceUsdt} USDT (~${context.walletBalanceRwf ?? "?"} RWF).`
      : context.walletBalanceRwf
        ? `Estimated balance: ${context.walletBalanceRwf} RWF.`
        : "Balance sync may be offline — open Wallet to refresh.";

    const portfolioLine = context.cryptoPortfolioSummary
      ? `\nHoldings: ${context.cryptoPortfolioSummary}`
      : "";

    return reply(
      {
        reply: `Your FastPay crypto wallet supports USDT, BTC, and SOL.\n${balanceLine}${portfolioLine}`,
        sources: [{ title: "Wallet", source: "local/wallet", route: "/wallet" }],
        actions: [{ label: "Open Wallet", href: "/wallet" }],
        intent: "balance",
      },
      started,
    );
  }

  if (intent === "cash_flow" && context.budgetSnapshot) {
    const { monthlyIncomeRwf, spendPercent, savingsPercent } = context.budgetSnapshot;
    const spendLine =
      spendPercent != null
        ? `You allocate ${spendPercent}% of income to spending`
        : "Spending split not configured yet";
    const savingsLine =
      savingsPercent != null
        ? ` and ${savingsPercent}% to savings.`
        : ".";

    let coaching =
      spendPercent != null && spendPercent > 70
        ? "\nTip: spending is high — review Analytics and trim discretionary buckets."
        : savingsPercent != null && savingsPercent < 10
          ? "\nTip: boost savings to at least 10% before increasing transfers."
          : "\nYour cash-flow split looks balanced — keep tracking weekly in Analytics.";

    if (context.engagementSummary?.includes("budget")) {
      coaching += "\nI see you ask about budgets often — open Analytics to adjust your plan.";
    }

    return reply(
      {
        reply: `Monthly income: ${monthlyIncomeRwf?.toLocaleString() ?? "?"} RWF.\n${spendLine}${savingsLine}${coaching}`,
        sources: [{ title: "Analytics", source: "local/cash-flow", route: "/analytics" }],
        actions: [{ label: "Review cash flow", href: "/analytics" }],
        intent: "cash_flow",
      },
      started,
    );
  }

  if (intent === "planning") {
    const goals = context.budgetSnapshot?.goals ?? [];
    const goalLine =
      goals.length > 0
        ? goals
            .slice(0, 3)
            .map(
              (g) =>
                `• ${g.name}: ${g.savedRwf.toLocaleString()} / ${g.targetRwf.toLocaleString()} RWF`,
            )
            .join("\n")
        : "No savings goals yet — set one in Analytics.";

    const engagementHint = context.engagementSummary
      ? `\n\nBased on your activity:\n${context.engagementSummary}`
      : "";

    return reply(
      {
        reply: `Here is your financial direction:\n1. Keep USDT for day-to-day liquidity\n2. Hold BTC/SOL for longer-term growth\n3. Automate savings before spending\n\nGoals:\n${goalLine}${engagementHint}`,
        sources: [{ title: "Planning", source: "local/planning", route: "/analytics" }],
        actions: [
          { label: "Open Analytics", href: "/analytics" },
          { label: "Add funds", href: "/buy" },
        ],
        intent: "planning",
      },
      started,
    );
  }

  if (intent === "kyc" && context.user) {
    return reply(
      {
        reply: `Your KYC status is ${formatKycStatus(context.user.kycStatus)} (level ${context.user.kycLevel}). Upload ID and proof of address to increase limits.`,
        sources: [{ title: "KYC", source: "local/kyc", route: "/(auth)/kyc" }],
        actions: [{ label: "Complete KYC", href: "/(auth)/kyc" }],
        intent: "kyc",
      },
      started,
    );
  }

  if (intent === "passcode") {
    return reply(
      {
        reply:
          "Your 4-digit transaction passcode is stored only on this device. To reset it, verify your login password first.",
        sources: [{ title: "Passcode", source: "local/security" }],
        actions: [
          {
            label: "Reset passcode",
            href: String(featureRoutes.forgotPasscode("/support")),
          },
        ],
        intent: "passcode",
      },
      started,
    );
  }

  if (intent === "budget" && context.budgetSnapshot?.goals?.length) {
    const goal = context.budgetSnapshot.goals.find((g) =>
      lower.includes(g.name.toLowerCase()),
    );
    if (goal) {
      return reply(
        {
          reply: `Goal "${goal.name}": saved ${goal.savedRwf.toLocaleString()} RWF of ${goal.targetRwf.toLocaleString()} RWF target.`,
          sources: [{ title: "Analytics", source: "local/budget", route: "/analytics" }],
          actions: [{ label: "Open Analytics", href: "/analytics" }],
          intent: "budget",
        },
        started,
      );
    }

    const summary = context.budgetSnapshot.goals
      .slice(0, 3)
      .map(
        (g) =>
          `• ${g.name}: ${g.savedRwf.toLocaleString()} / ${g.targetRwf.toLocaleString()} RWF`,
      )
      .join("\n");

    return reply(
      {
        reply: `Your savings goals:\n${summary}`,
        sources: [{ title: "Analytics", source: "local/budget", route: "/analytics" }],
        actions: [{ label: "View goals", href: "/analytics?mode=goals" }],
        intent: "budget",
      },
      started,
    );
  }

  if (intent === "navigate") {
    const routes: { match: RegExp; label: string; href: string }[] = [
      { match: /\bbill/i, label: "Bills", href: "/bills" },
      { match: /\bwallet|transfer|send/i, label: "Wallet", href: "/wallet" },
      { match: /\bbuy|momo|airtime/i, label: "Buy", href: "/buy" },
      { match: /\banalytic|budget|goal/i, label: "Analytics", href: "/analytics" },
      { match: /\bsetting/i, label: "Settings", href: "/settings" },
      { match: /\bkyc|verify/i, label: "KYC", href: "/(auth)/kyc" },
      { match: /\bfamily/i, label: "Family", href: "/services/family-setup" },
      { match: /\bloan/i, label: "Loan", href: "/loan/apply" },
      { match: /\birembo/i, label: "Irembo", href: "/irembo" },
      { match: /\boffline/i, label: "Offline", href: "/offline/receive" },
    ];

    for (const route of routes) {
      if (route.match.test(lower)) {
        return reply(
          {
            reply: `Opening ${route.label}. Tap below if you are not redirected automatically.`,
            sources: [{ title: route.label, source: "local/nav", route: route.href }],
            actions: [{ label: `Go to ${route.label}`, href: route.href }],
            intent: "navigate",
          },
          started,
        );
      }
    }
  }

  return null;
}
