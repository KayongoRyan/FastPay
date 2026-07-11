import { Users } from "lucide-react-native";

import { ServiceScreenShell } from "@/components/services";

export default function FamilyWalletScreen() {
  return (
    <ServiceScreenShell
      title="Family Wallet"
      icon={Users}
      description="Shared wallet for your household with member limits and approvals."
      features={[
        "Invite family members and assign roles",
        "Set daily and monthly spending limits",
        "Approve payments before they go out",
        "Track shared balances in one place",
      ]}
    />
  );
}
