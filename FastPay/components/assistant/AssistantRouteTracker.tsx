import { useEffect } from "react";
import { usePathname } from "expo-router";

import { useAssistantEngagementStore } from "@/store/assistantEngagementStore";

export function AssistantRouteTracker() {
  const pathname = usePathname();
  const recordRouteVisit = useAssistantEngagementStore((s) => s.recordRouteVisit);
  const initialize = useAssistantEngagementStore((s) => s.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (pathname) {
      void recordRouteVisit(pathname);
    }
  }, [pathname, recordRouteVisit]);

  return null;
}
