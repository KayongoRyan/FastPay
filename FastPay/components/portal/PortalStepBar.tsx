import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  steps: string[];
  current: number;
};

export function PortalStepBar({ steps, current }: Props) {
  return (
    <View style={styles.row}>
      {steps.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <View key={label} style={[styles.item, (active || done) && styles.itemOn]}>
            <View style={[styles.dot, (active || done) && styles.dotOn]}>
              <Text style={[styles.n, (active || done) && styles.nOn]}>{i + 1}</Text>
            </View>
            <Text style={[styles.label, (active || done) && styles.labelOn]} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

type LinkRowProps = {
  onMerchant?: () => void;
  onBusiness?: () => void;
  onConsumer?: () => void;
};

export function PortalAuthLinks({ onMerchant, onBusiness, onConsumer }: LinkRowProps) {
  return (
    <View style={styles.links}>
      {onMerchant ? (
        <Pressable onPress={onMerchant}>
          <Text style={styles.link}>Merchant portal</Text>
        </Pressable>
      ) : null}
      {onBusiness ? (
        <Pressable onPress={onBusiness}>
          <Text style={styles.link}>Business HQ</Text>
        </Pressable>
      ) : null}
      {onConsumer ? (
        <Pressable onPress={onConsumer}>
          <Text style={styles.link}>Personal wallet</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    opacity: 0.4,
  },
  itemOn: {
    opacity: 1,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotOn: {
    backgroundColor: colors.primary,
  },
  n: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  nOn: {
    color: colors.white,
  },
  label: {
    color: colors.textSubtle,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  labelOn: {
    color: colors.textMuted,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  link: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});
