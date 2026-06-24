import { Image, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface TokenListRowProps {
  title: string;
  date: string;
  amount: string;
  imageUri?: string;
}

export function TokenListRow({ title, date, amount, imageUri }: TokenListRowProps) {
  return (
    <View style={styles.row}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
  },
  thumbPlaceholder: {
    backgroundColor: colors.inputBg,
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "500",
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
