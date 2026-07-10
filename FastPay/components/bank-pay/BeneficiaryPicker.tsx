import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Check, X } from "lucide-react-native";

import { BENEFICIARIES } from "@/lib/bank-pay/data";
import type { BankPayBeneficiary } from "@/lib/bank-pay/types";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface BeneficiaryPickerProps {
  visible: boolean;
  selectedId: string | null;
  onClose: () => void;
  onSelect: (beneficiary: BankPayBeneficiary) => void;
}

export function BeneficiaryPicker({
  visible,
  selectedId,
  onClose,
  onSelect,
}: BeneficiaryPickerProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Select beneficiary</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X color={colors.white} size={22} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {BENEFICIARIES.map((item) => {
              const selected = item.id === selectedId;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.row, selected && styles.rowSelected]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>{item.name}</Text>
                    <Text style={styles.rowMeta}>
                      {item.category} · {item.fastPayCode}
                    </Text>
                  </View>
                  {selected ? <Check color={colors.primary} size={20} /> : null}
                </Pressable>
              );
            })}
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
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    maxHeight: "70%",
    backgroundColor: colors.backgroundDeep,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.inputBg,
  },
  rowSelected: {
    borderColor: colors.primary,
  },
  rowInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  rowTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});
