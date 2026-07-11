import { ShieldCheck } from "lucide-react-native";

import { ServiceScreenShell } from "@/components/services";

export default function InsuranceScreen() {
  return (
    <ServiceScreenShell
      title="Insurance"
      icon={ShieldCheck}
      description="Pay health, motor, and device premiums directly from your FastPay wallet."
      features={[
        "Browse plans from partner insurers",
        "Pay premiums on a schedule",
        "Store policy documents in-app",
        "Get renewal reminders before expiry",
      ]}
    />
  );
}
