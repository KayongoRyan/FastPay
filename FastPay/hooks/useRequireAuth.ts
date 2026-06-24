import { Href, router } from "expo-router";
import { useEffect } from "react";

import { useAuthStore } from "@/store/authStore";

export function useRequireAuth() {
  const { user, isReady, isLocked, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isReady) return;
    if (isLocked) {
      router.replace("/biometric-unlock" as Href);
      return;
    }
    if (!user) {
      router.replace("/login" as Href);
    }
  }, [isReady, isLocked, user]);

  return { user, isReady, isLoading };
}
