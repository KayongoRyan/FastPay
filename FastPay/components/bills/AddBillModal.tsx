import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { BILL_CATEGORIES } from "@/lib/bills/categories";
import type { BillCategoryId } from "@/lib/bills/types";
import { validateAddBillForm } from "@/lib/bills/validation";
import { parseAmountRwf, toIsoDate } from "@/lib/bills/utils";
import { useBillsStore } from "@/store/billsStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface AddBillModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded?: (paidAt: string) => void;
}

export function AddBillModal({ visible, onClose, onAdded }: AddBillModalProps) {
  const insets = useSafeAreaInsets();
  const { addPayment, isSaving } = useBillsStore();

  const [label, setLabel] = useState("");
  const [categoryId, setCategoryId] = useState<BillCategoryId>("rent");
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(toIsoDate(new Date()));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setLabel("");
    setCategoryId("rent");
    setAmount("");
    setPaidAt(toIsoDate(new Date()));
    setError(null);
  }, [visible]);

  const handleSubmit = async () => {
    const validationError = validateAddBillForm({
      label,
      categoryId,
      amount,
      paidAt,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    const payment = await addPayment({
      label: label.trim(),
      categoryId,
      amountRwf: parseAmountRwf(amount),
      paidAt,
    });

    if (!payment) {
      setError("Could not save bill. Try again.");
      return;
    }

    onAdded?.(payment.paidAt);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Add bill payment</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X color={colors.white} size={22} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {(Object.keys(BILL_CATEGORIES) as BillCategoryId[]).map((id) => {
                const category = BILL_CATEGORIES[id];
                const Icon = category.icon;
                const active = categoryId === id;

                return (
                  <Pressable
                    key={id}
                    style={[styles.categoryChip, active && styles.categoryChipActive]}
                    onPress={() => setCategoryId(id)}
                  >
                    <Icon color={active ? colors.white : colors.textMuted} size={16} />
                    <Text
                      style={[styles.categoryChipText, active && styles.categoryChipTextActive]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Input
              label="Bill name"
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Apartment rent"
            />

            <Input
              label="Amount (RWF)"
              value={amount}
              onChangeText={setAmount}
              placeholder="350000"
              keyboardType="number-pad"
            />

            <Input
              label="Payment date"
              value={paidAt}
              onChangeText={setPaidAt}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <PrimaryButton
              label="Save bill"
              onPress={() => void handleSubmit()}
              loading={isSaving}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: colors.backgroundDeep,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  categoryRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.md,
  },
});
