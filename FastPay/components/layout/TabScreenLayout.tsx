import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export const TAB_BAR_PADDING = 88;

interface TabScreenLayoutProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  footer?: ReactNode;
  /** Override default bottom padding reserved for tab bar (default 88). */
  bottomInset?: number;
}

export function TabScreenLayout({
  children,
  scroll = true,
  style,
  footer,
  bottomInset = TAB_BAR_PADDING,
}: TabScreenLayoutProps) {
  const contentStyle = [
    styles.content,
    { paddingBottom: bottomInset },
    style,
  ];

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[contentStyle, styles.flex]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {body}
        {footer}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
