import { Href, Redirect } from "expo-router";

import { useBusinessAuthStore } from "@/store/businessAuthStore";

export default function BusinessIndex() {
  const { user, isReady } = useBusinessAuthStore();
  if (!isReady) return null;
  if (user) return <Redirect href={"/business/(app)" as Href} />;
  return <Redirect href={"/business/login" as Href} />;
}
