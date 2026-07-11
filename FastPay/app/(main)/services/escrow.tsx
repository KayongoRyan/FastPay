import { Handshake } from "lucide-react-native";

import { ServiceScreenShell } from "@/components/services";

export default function EscrowScreen() {
  return (
    <ServiceScreenShell
      title="Escrow"
      icon={Handshake}
      description="Hold funds safely until both sides confirm delivery or service completion."
      features={[
        "Lock payment until terms are met",
        "Buyer and seller dispute workflow",
        "Automatic release on confirmation",
        "Full audit trail for every step",
      ]}
    />
  );
}
