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
    href: "/quick-links/bank-pay",
    section: "pinned",
  },
  {
    id: "app_to_app",
    label: "FastPay to FastPay",
    shortLabel: "FastPay",
    icon: ArrowLeftRight,
    href: "/quick-links/fastpay",
    section: "pinned",
  },
  {
    id: "app_to_momo",
    label: "FastPay to MoMo",
    shortLabel: "MoMo",
    icon: Smartphone,
    href: "/quick-links/momo",
    section: "pinned",
  },
  {
    id: "statement",
    label: "Statement",
    icon: FileText,
    href: "/quick-links/statement",
    section: "pinned",
  },
  {
    id: "get_loan",
    label: "Get Loan",
    icon: HandCoins,
    href: "/quick-links/get-loan",
    section: "pinned",
  },
  {
    id: "utilities",
    label: "Electricity & Water",
    icon: Droplets,
    href: "/quick-links/utilities",
    section: "pinned",
  },
  {
    id: "savings",
    label: "Open Savings",
    icon: PiggyBank,
    href: "/quick-links/savings",
    section: "pinned",
  },
  {
    id: "pay_tax",
    label: "Pay Tax",
    icon: Receipt,
    href: "/quick-links/pay-tax",
    section: "more",
  },
  {
    id: "irembo",
    label: "Irembo",
    icon: Globe2,
    href: "/quick-links/irembo",
    section: "more",
  },
  {
    id: "airtime",
    label: "Airtime",
    icon: Wallet,
    href: "/quick-links/airtime",
    section: "more",
  },
  {
    id: "forex",
    label: "Forex",
    icon: TrendingUp,
    href: "/quick-links/forex",
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
