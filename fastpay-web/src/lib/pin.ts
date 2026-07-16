const PIN_KEY_PREFIX = "fastpay_pin_";

async function hashPin(pin: string, userId: string): Promise<string> {
  const data = new TextEncoder().encode(`${userId}:${pin}:fastpay-web`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hasPin(userId: string): boolean {
  return Boolean(localStorage.getItem(PIN_KEY_PREFIX + userId));
}

export async function savePin(userId: string, pin: string): Promise<void> {
  const hash = await hashPin(pin, userId);
  localStorage.setItem(PIN_KEY_PREFIX + userId, hash);
}

export async function verifyPin(userId: string, pin: string): Promise<boolean> {
  const stored = localStorage.getItem(PIN_KEY_PREFIX + userId);
  if (!stored) return false;
  return (await hashPin(pin, userId)) === stored;
}

export function clearPin(userId: string): void {
  localStorage.removeItem(PIN_KEY_PREFIX + userId);
}
