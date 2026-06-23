import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface AuthFooterProps {
  text: string;
  linkText: string;
  href: "/login" | "/register";
}

export function AuthFooter({ text, linkText, href }: AuthFooterProps) {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>{text} </Text>
      <Link href={href} asChild>
        <Pressable>
          <Text style={styles.link}>{linkText}</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
  },
  link: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
