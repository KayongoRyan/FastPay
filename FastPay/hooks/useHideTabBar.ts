import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback } from "react";
import { Platform } from "react-native";

import { FLOATING_TAB_BAR_HEIGHT } from "@/components/navigation/MainTabBar";

const VISIBLE_TAB_BAR_STYLE = {
  position: "absolute" as const,
  backgroundColor: "transparent",
  borderTopWidth: 0,
  elevation: 0,
  height: FLOATING_TAB_BAR_HEIGHT,
  ...(Platform.OS === "ios" ? { shadowOpacity: 0 } : {}),
};

/** Hide the main tab bar on stack screens (transfer, receive, etc.). */
export function useHideTabBar() {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: "none" } });

      return () => {
        parent?.setOptions({ tabBarStyle: VISIBLE_TAB_BAR_STYLE });
      };
    }, [navigation]),
  );
}
