import AsyncStorage from "@react-native-async-storage/async-storage";

const VERIFIED_RECEIVE_KEY = "fastpay_verified_monthly_receive";

/** Simulated inbound total from payment rails — swap for a real API later. */
export async function fetchVerifiedMonthlyReceiveRwf(
  userId: string,
): Promise<number> {
  const stored = await AsyncStorage.getItem(`${VERIFIED_RECEIVE_KEY}_${userId}`);
  if (stored !== null) {
    const parsed = Number(stored);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  // Demo default: qualifies for Bronze only (800k min).
  return 1_200_000;
}

/** Dev helper: override verified receive for testing tier eligibility. */
export async function setVerifiedMonthlyReceiveRwf(
  userId: string,
  amountRwf: number,
): Promise<void> {
  await AsyncStorage.setItem(
    `${VERIFIED_RECEIVE_KEY}_${userId}`,
    String(Math.max(0, amountRwf)),
  );
}
