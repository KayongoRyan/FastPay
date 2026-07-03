export function formatBillAmount(amountRwf: number): string {
  return `${amountRwf.toLocaleString("en-US")} RWF`;
}

export function formatBillDate(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function monthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function shortMonthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}
