import type { Href } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  ArrowLeftRight,
  Building2,
  Droplets,
  FileText,
  Globe2,
  HandCoins,
  MoreHorizontal,
  PiggyBank,
  Receipt,
  Smartphone,
  TrendingUp,
  Wallet,
} from "lucide-react-native";

export type QuickLinkItem = {
  id: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  href: Href;
  section?: "pinned" | "more";
};

export const QUICK_LINKS: QuickLinkItem[] = [
  {
    id: "bank_pay",
    label: "Bank Pay",
    icon: Building2,
    href: "/convert",
    section: "pinned",
  },
  {
    id: "app_to_app",
    label: "App to App payment",
    shortLabel: "To FastPay",
    icon: ArrowLeftRight,
    href: "/wallet/transfer",
    section: "pinned",
  },
  {
    id: "app_to_momo",
    label: "App to MoMo",
    shortLabel: "To MoMo",
    icon: Smartphone,
    href: "/buy",
    section: "pinned",
  },
  {
    id: "statement",
    label: "Statement",
    icon: FileText,
    href: "/analytics",
    section: "pinned",
  },
  {
    id: "get_loan",
    label: "Get Loan",
    icon: HandCoins,
    href: "/settings",
    section: "pinned",
  },
  {
    id: "utilities",
    label: "Electricity & Water",
    icon: Droplets,
    href: "/bills",
    section: "pinned",
  },
  {
    id: "savings",
    label: "Open Savings",
    icon: PiggyBank,
    href: "/wallet",
    section: "pinned",
  },
  {
    id: "pay_tax",
    label: "Pay Tax",
    icon: Receipt,
    href: "/bills",
    section: "more",
  },
  {
    id: "irembo",
    label: "Irembo",
    icon: Globe2,
    href: "/settings",
    section: "more",
  },
  {
    id: "airtime",
    label: "Airtime",
    icon: Wallet,
    href: "/buy",
    section: "more",
  },
  {
    id: "forex",
    label: "Forex",
    icon: TrendingUp,
    href: "/convert",
    section: "more",
  },
];

export const HOME_QUICK_LINK_IDS = [
  "bank_pay",
  "app_to_app",
  "app_to_momo",
] as const;

export const HOME_QUICK_LINKS: QuickLinkItem[] = HOME_QUICK_LINK_IDS.map(
  (id) => QUICK_LINKS.find((link) => link.id === id)!,
);

export const MORE_QUICK_LINK: QuickLinkItem = {
  id: "more",
  label: "More",
  icon: MoreHorizontal,
  href: "/quick-links",
};

export const PINNED_QUICK_LINKS = QUICK_LINKS.filter(
  (link) => link.section === "pinned",
);

export const MORE_FEATURE_LINKS = QUICK_LINKS.filter(
  (link) => link.section === "more",
);

export function getQuickLinkLabel(link: QuickLinkItem, useShort = false): string {
  if (useShort && link.shortLabel) {
    return link.shortLabel;
  }
  return link.label;
}
