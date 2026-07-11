import { PiggyBank } from "lucide-react-native";

import { ServiceScreenShell } from "@/components/services";

export default function SavingsGoalScreen() {
  return (
    <ServiceScreenShell
      title="Savings Goal"
      icon={PiggyBank}
      description="Create goals, contribute automatically, and track progress together."
      features={[
        "Set target amount and deadline",
        "Round-up or scheduled contributions",
        "Family and group savings pots",
        "Celebrate milestones when goals complete",
      ]}
    />
  );
}
