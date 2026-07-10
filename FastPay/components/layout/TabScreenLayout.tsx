import { ReactNode, RefObject, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  Platform,
  RefreshControl,
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
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Extra scroll padding while the software keyboard is open. */
  adjustForKeyboard?: boolean;
}

export function TabScreenLayout({
  children,
  scroll = true,
  style,
  footer,
  bottomInset,
  scrollRef,
  refreshing,
  onRefresh,
  adjustForKeyboard = false,
}: TabScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const tabBarPadding = useTabBarPadding(bottomInset);
  const [keyboardInset, setKeyboardInset] = useState(0);

  useEffect(() => {
    if (!adjustForKeyboard) {
      return;
    }

    const onShow = (event: KeyboardEvent) => {
      setKeyboardInset(event.endCoordinates.height);
    };
    const onHide = () => setKeyboardInset(0);

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [adjustForKeyboard]);

  const contentStyle = [
    styles.content,
    {
      paddingBottom:
        tabBarPadding +
        (adjustForKeyboard && Platform.OS !== "ios" ? keyboardInset : 0),
    },
    style,
  ];

  const body = scroll ? (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={contentStyle}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets={
        adjustForKeyboard && Platform.OS === "ios"
      }
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} />
        ) : undefined
      }
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
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
