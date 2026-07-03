import {
  Droplets,
  Home,
  ShoppingCart,
  Wifi,
  Zap,
} from "lucide-react-native";

import type { BillCategory, BillCategoryId } from "@/lib/bills/types";

export const BILL_CATEGORIES: Record<BillCategoryId, BillCategory> = {
  rent: {
    id: "rent",
    label: "Rent",
    icon: Home,
    tint: "rgba(0,174,239,0.18)",
  },
  groceries: {
    id: "groceries",
    label: "Groceries",
    icon: ShoppingCart,
    tint: "rgba(74,222,128,0.18)",
  },
  wifi: {
    id: "wifi",
    label: "WiFi",
    icon: Wifi,
    tint: "rgba(168,85,247,0.18)",
  },
  electricity: {
    id: "electricity",
    label: "Electricity",
    icon: Zap,
    tint: "rgba(251,191,36,0.18)",
  },
  water: {
    id: "water",
    label: "Water",
    icon: Droplets,
    tint: "rgba(56,189,248,0.18)",
  },
};

export function getBillCategory(id: BillCategoryId): BillCategory {
  return BILL_CATEGORIES[id];
}
