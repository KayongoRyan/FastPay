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

  if (intent === "balance" || /\b(wallet address|public key)\b/i.test(lower)) {
    if (!context.walletPublicKey) {
      return reply(
        {
          reply:
            "You do not have a wallet loaded yet. Open Wallet to create or link your Stellar account.",
          sources: [{ title: "Wallet", source: "local/wallet" }],
          actions: [{ label: "Open Wallet", href: "/wallet" }],
          intent: "balance",
        },
        started,
      );
    }

    const balanceLine = context.walletBalanceRwf
      ? `Estimated balance: ${context.walletBalanceRwf}.`
      : "Balance sync may be offline — open Wallet to refresh.";

    return reply(
      {
        reply: `Your Stellar public key is ${context.walletPublicKey}.\n${balanceLine}`,
        sources: [{ title: "Wallet", source: "local/wallet", route: "/wallet" }],
        actions: [{ label: "Open Wallet", href: "/wallet" }],
        intent: "balance",
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
