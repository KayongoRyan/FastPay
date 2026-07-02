import { Redirect, useLocalSearchParams } from "expo-router";

/** Legacy route — redirects to dedicated Transfer or Receive screens. */
export default function SendReceiveRedirect() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  if (mode === "receive") {
    return <Redirect href="/wallet/receive" />;
  }

  return <Redirect href="/wallet/transfer" />;
}
