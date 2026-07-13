/** Reserved 4-digit institution prefix for all FastPay accounts. */
export const FASTPAY_INSTITUTION_CODE = "4250";

const ACCOUNT_LENGTH = 16;
const SUFFIX_LENGTH = ACCOUNT_LENGTH - FASTPAY_INSTITUTION_CODE.length;

function deriveUniqueSuffix(seed: string): string {
  let accA = 0;
  let accB = 0;

  for (let i = 0; i < seed.length; i++) {
    const code = seed.charCodeAt(i);
    accA = (accA * 31 + code) >>> 0;
    accB = (accB * 37 + code * (i + 1)) >>> 0;
  }

  const left = (accA % 1_000_000).toString().padStart(6, "0");
  const right = (accB % 1_000_000).toString().padStart(6, "0");
  return `${left}${right}`.slice(0, SUFFIX_LENGTH);
}

/** 16-digit FastPay account number: 4-digit code + 12 unique digits per user. */
export function buildFastPayAccountNumber(userId: string): string {
  const normalized = userId.trim();
  if (!normalized) {
    return FASTPAY_INSTITUTION_CODE + "0".repeat(SUFFIX_LENGTH);
  }

  return `${FASTPAY_INSTITUTION_CODE}${deriveUniqueSuffix(normalized)}`;
}

/** Display as `4250 1234 5678 9012`. */
export function formatFastPayAccountNumberDisplay(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length !== ACCOUNT_LENGTH) {
    return accountNumber;
  }

  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}
