import type { Href } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import {
  ArrowLeftRight,
  BadgeCheck,
  Handshake,
  MoreHorizontal,
  PiggyBank,
  Receipt,
  Scale,
  ShieldCheck,
  TicketPercent,
  Users,
  WifiOff,
} from "lucide-react-native";

export type ServiceItem = {
  id: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  href?: Href;
};

export const PRIMARY_SERVICES: ServiceItem[] = [
  {
    id: "transfer",
    label: "Transfer",
    icon: ArrowLeftRight,
    href: "/services/transfer",
  },
  {
    id: "voucher",
    label: "Voucher",
    icon: TicketPercent,
    href: "/services/voucher",
  },
  {
    id: "bill",
    label: "Bill",
    icon: Receipt,
    href: "/services/bill",
  },
  {
    id: "more",
    label: "More",
    icon: MoreHorizontal,
    href: "/services",
  },
];

/** Primary services shown on home, excluding the More entry. */
export const CORE_SERVICES = PRIMARY_SERVICES.filter(
  (service) => service.id !== "more",
);

export const MORE_SERVICES: ServiceItem[] = [
  {
    id: "family-wallet",
    label: "Family Wallet",
    shortLabel: "Family",
    icon: Users,
    href: "/services/family-wallet",
  },
  {
    id: "savings-goal",
    label: "Savings Goal",
    shortLabel: "Savings",
    icon: PiggyBank,
    href: "/services/savings-goal",
  },
  {
    id: "escrow",
    label: "Escrow",
    icon: Handshake,
    href: "/services/escrow",
  },
  {
    id: "insurance",
    label: "Insurance",
    icon: ShieldCheck,
    href: "/services/insurance",
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: Scale,
    href: "/services/compliance",
  },
  {
    id: "kyc",
    label: "Verify ID",
    shortLabel: "KYC",
    icon: BadgeCheck,
    href: "/kyc",
  },
  {
    id: "offline-pay",
    label: "Offline Pay",
    shortLabel: "Offline",
    icon: WifiOff,
    href: "/services/offline-pay",
  },
];

/** Full catalog on the More Services page. */
export const MORE_PAGE_SERVICES: ServiceItem[] = [
  ...CORE_SERVICES,
  ...MORE_SERVICES,
];

export function getServiceLabel(service: ServiceItem, useShort = false): string {
  if (useShort && service.shortLabel) {
    return service.shortLabel;
  }
  return service.label;
}
