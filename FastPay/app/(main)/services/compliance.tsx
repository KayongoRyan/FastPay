import { Scale } from "lucide-react-native";

import { ServiceScreenShell } from "@/components/services";

export default function ComplianceScreen() {
  return (
    <ServiceScreenShell
      title="Compliance"
      icon={Scale}
      description="Screen wallets and transactions against sanctions and fraud rules."
      features={[
        "Address and transaction screening",
        "Real-time risk scoring",
        "Audit logs for regulatory review",
        "Block high-risk activity before settlement",
      ]}
    />
  );
}
