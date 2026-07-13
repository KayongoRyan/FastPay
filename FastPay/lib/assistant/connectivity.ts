import { Platform } from "react-native";

export async function getNetworkStatus(): Promise<boolean> {
  if (Platform.OS === "web") {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  }

  try {
    const NetInfo = await import("@react-native-community/netinfo");
    const state = await NetInfo.default.fetch();
    return Boolean(state.isConnected && state.isInternetReachable !== false);
  } catch {
    return true;
  }
}
