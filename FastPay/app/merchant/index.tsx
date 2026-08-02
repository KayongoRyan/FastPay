import { Href, Redirect } from "expo-router";

import { useMerchantAuthStore } from "@/store/merchantAuthStore";

export default function MerchantIndex() {
  const { user, isReady } = useMerchantAuthStore();
  if (!isReady) return null;
  if (user) return <Redirect href={"/merchant/(app)" as Href} />;
  return <Redirect href={"/merchant/login" as Href} />;
}
