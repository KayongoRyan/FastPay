import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { ServiceIconGrid } from "@/components/services";
import { BackHeader } from "@/components/ui/BackHeader";
import { useHideTabBar } from "@/hooks/useHideTabBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { MORE_PAGE_SERVICES } from "@/lib/services/data";

export default function MoreServicesScreen() {
  useRequireAuth();
  useHideTabBar();

  return (
    <TabScreenLayout>
      <BackHeader title="More Services" />
      <ServiceIconGrid services={MORE_PAGE_SERVICES} variant="list" />
    </TabScreenLayout>
  );
}
