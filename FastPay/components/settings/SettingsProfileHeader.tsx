import { StyleSheet, Text, View } from "react-native";
import { ShieldCheck, ShieldAlert } from "lucide-react-native";

import type { AuthUser } from "@/lib/auth/types";
import {
  formatKycStatus,
  getPrimaryIdentifier,
  getProfileInitials,
} from "@/lib/settings/profile";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface SettingsProfileHeaderProps {
  user: AuthUser;
}

export function SettingsProfileHeader({ user }: SettingsProfileHeaderProps) {
  const verified = user.kycStatus.toLowerCase() === "approved";
  const StatusIcon = verified ? ShieldCheck : ShieldAlert;

  return (
    <View style={styles.wrap}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>{getProfileInitials(user.fullName)}</Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.identifier}>{getPrimaryIdentifier(user)}</Text>

        <View style={styles.badges}>
          <View style={[styles.badge, verified ? styles.badgeVerified : styles.badgePending]}>
            <StatusIcon
              color={verified ? colors.success : colors.primary}
              size={14}
            />
            <Text
              style={[
                styles.badgeText,
                verified ? styles.badgeTextVerified : styles.badgeTextPending,
              ]}
            >
              {formatKycStatus(user.kycStatus)}
            </Text>
          </View>

          <View style={[styles.badge, user.isActive ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={styles.badgeTextMuted}>
              {user.isActive ? "Active account" : "Inactive"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.inputBg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.cardTeal,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "700",
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "700",
  },
  identifier: {
    color: colors.textMuted,
    fontSize: 14,
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badgeVerified: {
    borderColor: "rgba(74,222,128,0.35)",
    backgroundColor: "rgba(74,222,128,0.12)",
  },
  badgePending: {
    borderColor: "rgba(0,174,239,0.35)",
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  badgeActive: {
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  badgeInactive: {
    borderColor: "rgba(248,113,113,0.35)",
    backgroundColor: "rgba(248,113,113,0.12)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  badgeTextVerified: {
    color: colors.success,
  },
  badgeTextPending: {
    color: colors.primary,
  },
  badgeTextMuted: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
});
