export type Plan = {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  featured: boolean;
};

export const plans: Plan[] = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Perfect for personal use and getting started.",
    features: [
      "1 virtual card",
      "Weekly & monthly budgets",
      "Domestic transfers",
      "Basic AI assistant",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/mo",
    desc: "For power users who need global access.",
    features: [
      "5 virtual + 1 physical card",
      "Weekly, monthly & yearly budgets",
      "40+ currency convert",
      "Priority AI assistant",
      "FX rate alerts",
    ],
    featured: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/mo",
    desc: "Built for teams and growing companies.",
    features: [
      "Unlimited cards & team seats",
      "Multi-entity dashboards",
      "API access & webhooks",
      "Dedicated support",
      "Custom spending policies",
    ],
    featured: false,
  },
];

export const comparisonRows = [
  { feature: "Virtual cards", starter: "1", pro: "5", business: "Unlimited" },
  { feature: "Physical cards", starter: "—", pro: "1", business: "Unlimited" },
  { feature: "Budget periods", starter: "Weekly, Monthly", pro: "All 3", business: "All 3" },
  { feature: "Currency convert", starter: "—", pro: "40+", business: "40+" },
  { feature: "International transfers", starter: "—", pro: "✓", business: "✓" },
  { feature: "AI assistant", starter: "Basic", pro: "Priority", business: "Dedicated" },
  { feature: "Team seats", starter: "1", pro: "3", business: "Unlimited" },
  { feature: "API access", starter: "—", pro: "—", business: "✓" },
  { feature: "Support", starter: "Email", pro: "Priority", business: "Dedicated" },
];
