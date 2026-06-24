export type CurrencyCode = "RWF" | "USD" | "EUR" | "KES" | "UGX" | "GBP";

export interface Currency {
  code: CurrencyCode;
  label: string;
  rateToUsdt: number;
}

/** Mock rates: 1 unit of currency → USDT */
export const CURRENCIES: Currency[] = [
  { code: "RWF", label: "Rwandan Franc", rateToUsdt: 0.0000108245 },
  { code: "USD", label: "US Dollar", rateToUsdt: 1 },
  { code: "EUR", label: "Euro", rateToUsdt: 1.08 },
  { code: "KES", label: "Kenyan Shilling", rateToUsdt: 0.0077 },
  { code: "UGX", label: "Ugandan Shilling", rateToUsdt: 0.00027 },
  { code: "GBP", label: "British Pound", rateToUsdt: 1.27 },
];

export function getCurrency(code: CurrencyCode): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function convertToUsdt(amount: number, currency: Currency): number {
  return amount * currency.rateToUsdt;
}

export function formatAmount(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function formatUsdt(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}
