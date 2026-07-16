export type SavingsAccountType = "flexible" | "goal" | "locked";

export type SavingsAccount = {
  id: string;
  name: string;
  type: SavingsAccountType;
  accountNumber: string;
  balance: number;
  target: number | null;
  lockYears: number | null;
  createdAt: string;
};

const STORAGE_KEY = "fastpay-savings-accounts";

export const savingsTypeMeta: Record<
  SavingsAccountType,
  { label: string; hint: string }
> = {
  flexible: {
    label: "Flexible savings",
    hint: "Withdraw anytime — ideal for emergency funds.",
  },
  goal: {
    label: "Goal-based",
    hint: "Short and long-term targets with progress tracking.",
  },
  locked: {
    label: "Family locked",
    hint: "Lock children's savings for 15–30 years.",
  },
};

function makeAccountNumber(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `FP-SAV-${n}-${String(Date.now()).slice(-4)}`;
}

export function loadSavingsAccounts(): SavingsAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavingsAccount[];
  } catch {
    return [];
  }
}

export function saveSavingsAccounts(accounts: SavingsAccount[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function createSavingsAccount(input: {
  name: string;
  type: SavingsAccountType;
  target?: number;
  lockYears?: number;
  initialDeposit?: number;
}): SavingsAccount {
  return {
    id: `sa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    type: input.type,
    accountNumber: makeAccountNumber(),
    balance: Math.max(0, input.initialDeposit ?? 0),
    target: input.type === "goal" ? (input.target ?? null) : input.target ?? null,
    lockYears: input.type === "locked" ? (input.lockYears ?? 15) : null,
    createdAt: new Date().toISOString(),
  };
}

export function totalSavingsBalance(accounts: SavingsAccount[]): number {
  return accounts.reduce((sum, a) => sum + a.balance, 0);
}
