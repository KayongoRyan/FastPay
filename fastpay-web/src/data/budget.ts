export type BudgetPeriod = "weekly" | "monthly" | "yearly";

export const budgetData: Record<
  BudgetPeriod,
  { label: string; bars: number[]; total: string; budget: string; remaining: string }
> = {
  weekly: {
    label: "This Week",
    bars: [45, 72, 38, 90, 55, 68, 42],
    total: "$1,240",
    budget: "$1,500",
    remaining: "$260",
  },
  monthly: {
    label: "This Month",
    bars: [60, 85, 70, 95, 55, 78, 62, 88, 45, 72, 80, 50],
    total: "$4,820",
    budget: "$5,500",
    remaining: "$680",
  },
  yearly: {
    label: "This Year",
    bars: [55, 78, 65, 88, 72, 90, 68, 82, 75, 60, 85, 70],
    total: "$58,400",
    budget: "$72,000",
    remaining: "$13,600",
  },
};

export const categories = [
  { name: "Food & Dining", amount: "$842", pct: 28, color: "var(--aqua)" },
  { name: "Transport", amount: "$520", pct: 17, color: "var(--navy-mid)" },
  { name: "Shopping", amount: "$680", pct: 22, color: "rgba(0,174,239,0.5)" },
  { name: "Bills & Utilities", amount: "$410", pct: 13, color: "var(--navy)" },
  { name: "Other", amount: "$598", pct: 20, color: "rgba(11,31,63,0.35)" },
];

export const analyticsMetrics = [
  { label: "Total Spent", value: "$4,820", change: "-12% vs last month" },
  { label: "Budget Used", value: "87.6%", change: "On track" },
  { label: "Top Category", value: "Food", change: "28% of spend" },
  { label: "Savings Rate", value: "18.2%", change: "+3.1% vs last month" },
];
