import type { AuthUser } from "@/lib/auth/types";

export function getProfileInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "FP";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function getPrimaryIdentifier(user: AuthUser): string {
  return user.email ?? user.phone ?? user.id;
}

export function getLoginMethodLabel(user: AuthUser): string {
  if (user.email && user.phone) {
    return "Email & phone";
  }
  if (user.email) {
    return "Email";
  }
  if (user.phone) {
    return "Phone";
  }
  return "Account ID";
}

export function formatKycStatus(status: string): string {
  const normalized = status.trim().toLowerCase();
  switch (normalized) {
    case "approved":
      return "Verified";
    case "pending":
    case "submitted":
      return "Under review";
    case "rejected":
      return "Rejected";
    case "not_started":
    case "none":
      return "Not started";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export function truncateId(id: string, visible = 8): string {
  if (id.length <= visible + 3) {
    return id;
  }
  return `${id.slice(0, visible)}…`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) {
    return phone;
  }
  return `••• ••• ${digits.slice(-4)}`;
}
