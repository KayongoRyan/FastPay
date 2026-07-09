import { apiPostAuth } from "./client";

export async function sendEmailOtp(): Promise<{
  sent: boolean;
  expiresInSeconds: number;
  debugCode?: string;
}> {
  return apiPostAuth("/auth/verification/send-otp", {});
}

export async function verifyEmailOtp(
  code: string,
): Promise<{ verified: boolean }> {
  return apiPostAuth("/auth/verification/verify-otp", { code });
}
