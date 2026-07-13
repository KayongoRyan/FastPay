import {
  CreditCard,
  PiggyBank,
  RefreshCw,
  Shield,
  Smartphone,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  icon: LucideIcon;
  title: string;
  desc: string;
  bullets?: string[];
};

export const services: Service[] = [
  {
    icon: CreditCard,
    title: "Virtual & Physical Cards",
    desc: "Instant card issuance with customizable limits, categories, and freeze controls.",
    bullets: ["Instant virtual cards", "Physical card delivery", "Per-category limits"],
  },
  {
    icon: RefreshCw,
    title: "Currency Convert",
    desc: "Real-time exchange rates with zero hidden markup on 40+ currency pairs.",
    bullets: ["Live mid-market rates", "Rate lock option", "40+ currencies"],
  },
  {
    icon: PiggyBank,
    title: "Smart Budgeting",
    desc: "Weekly, monthly, and yearly budget builders with alerts when you approach limits.",
    bullets: ["3 budget periods", "Category tracking", "Overspend alerts"],
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    desc: "Biometric login, device binding, and transaction signing on every payment.",
    bullets: ["Biometric auth", "Device binding", "Fraud monitoring"],
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    desc: "Native iOS and Android apps with offline-ready transaction history.",
    bullets: ["iOS & Android", "Offline history", "Push notifications"],
  },
  {
    icon: Zap,
    title: "AI Assistant",
    desc: "Ask about balances, affordability, and savings — grounded in your data.",
    bullets: ["Balance queries", "Affordability checks", "Savings tips"],
  },
];

export const howItWorks = [
  {
    step: "01",
    title: "Create your account",
    desc: "Sign up in minutes with email or social login. Verify identity securely.",
  },
  {
    step: "02",
    title: "Fund your wallet",
    desc: "Link a bank account or card. Add funds via transfer or direct deposit.",
  },
  {
    step: "03",
    title: "Start moving money",
    desc: "Send, convert, budget, and get insights — all from one dashboard.",
  },
];
