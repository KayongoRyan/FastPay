import { Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface ChatActionRowProps {
  actions: { label: string; href: string }[];
}

export function ChatActionRow({ actions }: ChatActionRowProps) {
  if (!actions.length) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {actions.map((action, index) => (
        <Pressable
          key={`${action.href}-${index}`}
          style={styles.btn}
          onPress={() => router.push(action.href as Href)}
        >
          <Text style={styles.btnText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  btn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: "rgba(0, 174, 239, 0.12)",
  },
  btnText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
});
