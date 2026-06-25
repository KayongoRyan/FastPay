import { Pressable, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  CARD_TIERS,
  CardTierId,
  formatRwf,
  PURCHASABLE_TIERS,
} from "@/lib/cards/tiers";
import { useCardSubscriptionStore } from "@/store/cardSubscriptionStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

export function CardSubscriptionPanel() {
  const {
    ownedTierIds,
    activeTierId,
    isPurchasing,
    error,
    purchaseTier,
    applyTier,
  } = useCardSubscriptionStore();

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Card subscriptions</Text>
      <Text style={styles.subtitle}>
        Buy a tier, then apply the card design you want to use.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
            isPurchasing={isPurchasing}
            onApply={() => void applyTier(tierId)}
            onPurchase={() => void purchaseTier(tierId)}
          />
        );
      })}
    </View>
  );
}

interface TierRowProps {
  tierId: CardTierId;
  owned: boolean;
  active: boolean;
  isPurchasing?: boolean;
  onApply: () => void;
  onPurchase?: () => void;
}

function TierRow({
  tierId,
  owned,
  active,
  isPurchasing,
  onApply,
  onPurchase,
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
          <Text style={styles.rowPrice}>{tier.billingLabel}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {owned ? (
          active ? (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Applied</Text>
            </View>
          ) : (
            <Pressable style={styles.applyBtn} onPress={onApply}>
              <Text style={styles.applyBtnText}>Apply card</Text>
            </Pressable>
          )
        ) : (
          <PrimaryButton
            label={isPurchasing ? "Processing..." : `Buy ${formatRwf(tier.priceRwf)}`}
            onPress={() => onPurchase?.()}
            loading={isPurchasing}
            style={styles.buyBtn}
            labelStyle={styles.buyBtnLabel}
          />
        )}
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
  rowPrice: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  actions: {
    alignItems: "flex-start",
  },
  buyBtn: {
    minHeight: 42,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignSelf: "stretch",
  },
  buyBtnLabel: {
    fontSize: 14,
  },
  applyBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  applyBtnText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
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
