import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { CardApplicationModal } from "@/components/ui/CardApplicationModal";
import {
  CARD_TIERS,
  CardTierId,
  PurchasableTierId,
  PURCHASABLE_TIERS,
} from "@/lib/cards/tiers";
import { useCardSubscriptionStore } from "@/store/cardSubscriptionStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export function CardSubscriptionPanel() {
  const { ownedTierIds, activeTierId, error, applyTier, cancelTierCard, isCancelling } =
    useCardSubscriptionStore();
  const [formTierId, setFormTierId] = useState<PurchasableTierId | null>(null);

  const handleCancel = (tierId: PurchasableTierId) => {
    const tier = CARD_TIERS[tierId];
    Alert.alert(
      "Cancel card",
      `Remove your ${tier.label} card? You can apply again after verification.`,
      [
        { text: "Keep card", style: "cancel" },
        {
          text: "Cancel card",
          style: "destructive",
          onPress: () => void cancelTierCard(tierId),
        },
      ],
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Card subscriptions</Text>
      <Text style={styles.subtitle}>
        Apply for a tier, complete verification, then use the card you qualify
        for. Cancel anytime if you no longer need a tier.
      </Text>

      {error && !formTierId ? <Text style={styles.error}>{error}</Text> : null}

      <TierRow
        tierId="standard"
        owned
        active={activeTierId === "standard"}
        onApply={() => void applyTier("standard")}
      />

      {PURCHASABLE_TIERS.map((tierId) => {
        const owned = ownedTierIds.includes(tierId);
        const active = activeTierId === tierId;

        return (
          <TierRow
            key={tierId}
            tierId={tierId}
            owned={owned}
            active={active}
            cancelling={isCancelling}
            onApply={() => {
              if (owned && !active) {
                void applyTier(tierId);
                return;
              }
              setFormTierId(tierId);
            }}
            onCancel={owned ? () => handleCancel(tierId) : undefined}
          />
        );
      })}

      <CardApplicationModal
        tierId={formTierId}
        visible={formTierId !== null}
        onClose={() => setFormTierId(null)}
      />
    </View>
  );
}

interface TierRowProps {
  tierId: CardTierId;
  owned: boolean;
  active: boolean;
  cancelling?: boolean;
  onApply: () => void;
  onCancel?: () => void;
}

function TierRow({
  tierId,
  owned,
  active,
  cancelling,
  onApply,
  onCancel,
}: TierRowProps) {
  const tier = CARD_TIERS[tierId];

  return (
    <View style={[styles.row, active && styles.rowActive]}>
      <View style={styles.rowHeader}>
        <View
          style={[styles.swatch, { backgroundColor: tier.gradientColors[0] }]}
        />
        <View style={styles.rowInfo}>
          <Text style={styles.rowTitle}>{tier.label}</Text>
          <Text style={styles.rowDesc}>{tier.description}</Text>
          <Text style={styles.rowRequirement}>{tier.requirementLabel}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {active ? (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        ) : (
          <Pressable style={styles.applyBtn} onPress={onApply}>
            <Text style={styles.applyBtnText}>
              {owned ? "Use card" : "Apply"}
            </Text>
          </Pressable>
        )}

        {onCancel ? (
          <Pressable
            style={[styles.cancelBtn, cancelling && styles.disabled]}
            onPress={onCancel}
            disabled={cancelling}
          >
            <Text style={styles.cancelBtnText}>
              {cancelling ? "Cancelling..." : "Cancel card"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.inputBg,
    gap: spacing.md,
  },
  rowActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,174,239,0.08)",
  },
  rowHeader: {
    flexDirection: "row",
    gap: spacing.md,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  rowDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  rowRequirement: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  applyBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    minWidth: 100,
    alignItems: "center",
  },
  applyBtnText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnText: {
    color: colors.error,
    fontWeight: "600",
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  activeBadge: {
    backgroundColor: "rgba(0,174,239,0.18)",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  activeBadgeText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
});
