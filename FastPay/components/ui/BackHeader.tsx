import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface BackHeaderProps {
  title?: string;
  onBack?: () => void;
}

export function BackHeader({ title, onBack }: BackHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <Pressable
        style={styles.back}
        onPress={onBack ?? (() => router.back())}
        hitSlop={12}
      >
        <ChevronLeft color={colors.white} size={28} />
      </Pressable>
      {title ? <Text style={styles.title}>{title}</Text> : <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    minHeight: 40,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginRight: 40,
  },
  spacer: {
    flex: 1,
  },
});
