export const walletAccount = {
  balance: 1248500,
  currency: "RWF",
  accountNumber: "FP-2201-8845-9012",
  weeklyChange: "+12.5%",
  savings: 420000,
  usdt: 96.4,
};

export type WalletTx = {
  id: string;
  name: string;
  detail: string;
  date: string;
  amount: number;
  direction: "in" | "out";
  category: "momo" | "bill" | "transfer" | "convert" | "buy";
};

export const recentTransactions: WalletTx[] = [
  { id: "tx1", name: "MoMo Top-up", detail: "MTN · +250788***202", date: "Today, 09:14", amount: 50000, direction: "in", category: "momo" },
  { id: "tx2", name: "Electricity token", detail: "EUCL · Meter 04-2231", date: "Yesterday, 18:40", amount: 12800, direction: "out", category: "bill" },
  { id: "tx3", name: "Transfer to Aline K.", detail: "FP-1104-2291-0034", date: "Yesterday, 12:05", amount: 85000, direction: "out", category: "transfer" },
  { id: "tx4", name: "RWF → USDT", detail: "Convert · rate 1420", date: "Jul 13, 21:12", amount: 142000, direction: "out", category: "convert" },
  { id: "tx5", name: "Salary deposit", detail: "KBC Ltd · payroll", date: "Jul 12, 08:00", amount: 650000, direction: "in", category: "transfer" },
  { id: "tx6", name: "Airtime bundle", detail: "Airtel · self", date: "Jul 11, 07:32", amount: 5000, direction: "out", category: "buy" },
];

export const walletCards = [
  { id: "c1", label: "Everyday", number: "4821 •••• •••• 9012", expiry: "12/28", theme: "aqua" },
  { id: "c2", label: "Savings", number: "4012 •••• •••• 3340", expiry: "03/29", theme: "gold" },
] as const;

export const trendingTokens = [
  { symbol: "XLM", name: "Stellar", price: "RWF 142", change: "+3.2%", up: true },
  { symbol: "USDT", name: "Tether", price: "RWF 1,420", change: "+0.1%", up: true },
  { symbol: "BTC", name: "Bitcoin", price: "RWF 92.4M", change: "-1.4%", up: false },
];

export const billers = [
  { id: "eucl", name: "Electricity (EUCL)", hint: "Meter number" },
  { id: "wasac", name: "Water (WASAC)", hint: "Customer ID" },
  { id: "canal", name: "Canal+ TV", hint: "Card number" },
  { id: "irembo", name: "Irembo services", hint: "Bill ID" },
  { id: "school", name: "School fees", hint: "Student reference" },
];

export const billHistory = [
  { id: "b1", biller: "Electricity (EUCL)", ref: "Meter 04-2231", date: "Jul 14", amount: 12800, status: "Paid" },
  { id: "b2", biller: "Water (WASAC)", ref: "CU-88410", date: "Jul 08", amount: 6400, status: "Paid" },
  { id: "b3", biller: "Canal+ TV", ref: "Card 3311", date: "Jul 02", amount: 15000, status: "Paid" },
];

export const convertRates: Record<string, number> = {
  USDT: 1420,
  USD: 1435,
  KES: 11.1,
};

export function formatRwf(amount: number): string {
  return `RWF ${amount.toLocaleString("en-US")}`;
}
