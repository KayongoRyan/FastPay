import { ReactNode, RefObject } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { FLOATING_TAB_BAR_HEIGHT } from "@/components/navigation/MainTabBar";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

/** Static fallback for layouts; prefer `useTabBarPadding()` in components. */
export const TAB_BAR_PADDING =
  FLOATING_TAB_BAR_HEIGHT + spacing.lg + spacing.sm;

/** Default bottom inset for content above the floating tab bar. */
export function useTabBarPadding(override?: number): number {
  const insets = useSafeAreaInsets();
  return (
    override ??
    FLOATING_TAB_BAR_HEIGHT + Math.max(insets.bottom, spacing.sm)
  );
}

interface TabScreenLayoutProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  footer?: ReactNode;
  /** Override default bottom padding reserved for tab bar. */
  bottomInset?: number;
  scrollRef?: RefObject<ScrollView | null>;
}

export function TabScreenLayout({
  children,
  scroll = true,
  style,
  footer,
  bottomInset,
  scrollRef,
}: TabScreenLayoutProps) {
  const tabBarPadding = useTabBarPadding(bottomInset);
  const contentStyle = [
    styles.content,
    { paddingBottom: tabBarPadding },
    style,
  ];

  const body = scroll ? (
    <ScrollView
      ref={scrollRef}
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
