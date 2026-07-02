import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Keyboard, Smartphone, Wallet } from "lucide-react-native";

import { Input } from "@/components/ui/Input";
import { NumericKeypad } from "@/components/ui/NumericKeypad";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { OfflineQrPayload } from "@/lib/offline/qr-payload";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

type TransferMethod = "phone" | "wallet";

export function TransferPanel() {
  const {
    isLoading,
    error,
    prepareOfflinePayment,
    relayOfflinePayment,
  } = useWalletStore();

  const [method, setMethod] = useState<TransferMethod>("phone");
  const [amount, setAmount] = useState("1");
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");
  const [qrPayload, setQrPayload] = useState<OfflineQrPayload | null>(null);
  const [relayResult, setRelayResult] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const numericAmount = Number(amount) || 0;

  const onKey = (key: string) => {
    if (key === "*") return;
    setAmount((prev) => `${prev}${key}`.replace(/^0+(?=\d)/, ""));
  };

  const onDelete = () =>
    setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));

  const handleTransfer = async () => {
    setLocalError(null);
    setRelayResult(null);

    const stellarDestination = destination.trim();

    if (!stellarDestination.startsWith("G") || stellarDestination.length < 56) {
      setLocalError("Enter a valid recipient Stellar wallet address (G...).");
      return;
    }

    if (method === "phone") {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 9) {
        setLocalError("Enter a valid recipient phone number.");
        return;
      }
    }

    if (numericAmount <= 0) {
      setLocalError("Enter an amount greater than zero.");
      return;
    }

    const prepared = await prepareOfflinePayment({
      destination: stellarDestination,
      amount: amount.trim(),
      recipientPhone: method === "phone" ? phone.trim() : undefined,
      memo: note.trim() || undefined,
    });

    setQrPayload({
      v: 1,
      signedTxXDR: prepared.signedTxXDR,
      recipientPhone: prepared.recipientPhone,
    });
  };

  const handleRelayNow = async () => {
    if (!qrPayload) return;

    const result = await relayOfflinePayment({
      signedTxXDR: qrPayload.signedTxXDR,
      recipientPhone: qrPayload.recipientPhone,
    });

    setRelayResult(`Transfer queued ${result.queueId} (~${result.estimatedSeconds}s)`);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.pageTag}>TRANSFER</Text>
        <Text style={styles.subtitle}>
          Send funds to a FastPay user or Stellar wallet address.
        </Text>

        <View style={styles.methodRow}>
          <MethodChip
            label="Phone"
            icon={Smartphone}
            active={method === "phone"}
            onPress={() => {
              setMethod("phone");
              setLocalError(null);
              setQrPayload(null);
            }}
          />
          <MethodChip
            label="Wallet"
            icon={Wallet}
            active={method === "wallet"}
            onPress={() => {
              setMethod("wallet");
              setLocalError(null);
              setQrPayload(null);
            }}
          />
        </View>

        <View style={styles.amountBadge}>
          <Text style={styles.amountLabel}>Amount (XLM)</Text>
        </View>

        <Pressable
          style={styles.amountWrap}
          onPress={() => setKeypadOpen(true)}
        >
          <Text style={styles.amount}>{numericAmount.toLocaleString()} XLM</Text>
          {keypadOpen ? <View style={styles.cursor} /> : null}
        </Pressable>

        {method === "phone" ? (
          <Input
            label="Recipient phone"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setLocalError(null);
            }}
            onFocus={() => setKeypadOpen(false)}
            keyboardType="phone-pad"
            placeholder="+250 7XX XXX XXX"
          />
        ) : null}

        <Input
          label="Recipient wallet address"
          value={destination}
          onChangeText={(text) => {
            setDestination(text);
            setLocalError(null);
          }}
          onFocus={() => setKeypadOpen(false)}
          placeholder="G..."
          autoCapitalize="characters"
        />

        <Input
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          onFocus={() => setKeypadOpen(false)}
          placeholder="Payment reference"
        />

        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Network fee (est.)</Text>
          <Text style={styles.feeValue}>~0.00001 XLM</Text>
        </View>

        {(localError ?? error) ? (
          <Text style={styles.error}>{localError ?? error}</Text>
        ) : null}

        <PrimaryButton
          label={isLoading ? "Processing..." : "TRANSFER"}
          onPress={() => void handleTransfer()}
          loading={isLoading}
          style={styles.transferBtn}
        />

        {qrPayload ? (
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>Signed — share or relay</Text>
            <QRCode
              value={JSON.stringify(qrPayload)}
              size={180}
              backgroundColor="#ffffff"
              color="#08182F"
            />
            <Text style={styles.qrHint}>
              Share this QR for offline delivery, or relay now if you are online.
            </Text>
            <PrimaryButton
              label="Relay now"
              onPress={() => void handleRelayNow()}
              loading={isLoading}
            />
          </View>
        ) : null}

        {relayResult ? <Text style={styles.success}>{relayResult}</Text> : null}

        {keypadOpen ? (
          <View style={styles.keypadWrap}>
            <NumericKeypad
              onKey={onKey}
              onDelete={onDelete}
              variant="convert"
              onClose={() => setKeypadOpen(false)}
            />
          </View>
        ) : null}
      </ScrollView>

      {!keypadOpen ? (
        <Pressable
          style={styles.keypadFab}
          onPress={() => setKeypadOpen(true)}
          hitSlop={8}
        >
          <Keyboard color={colors.white} size={24} />
        </Pressable>
      ) : null}
    </View>
  );
}

interface MethodChipProps {
  label: string;
  icon: typeof Smartphone;
  active: boolean;
  onPress: () => void;
}

function MethodChip({ label, icon: Icon, active, onPress }: MethodChipProps) {
  return (
    <Pressable
      style={[styles.methodChip, active && styles.methodChipActive]}
      onPress={onPress}
    >
      <Icon color={active ? colors.primary : colors.textMuted} size={18} />
      <Text style={[styles.methodChipText, active && styles.methodChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  pageTag: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  methodRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  methodChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 12,
    backgroundColor: colors.inputBg,
  },
  methodChipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,174,239,0.1)",
  },
  methodChipText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
  methodChipTextActive: {
    color: colors.primary,
  },
  amountBadge: {
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  amountLabel: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  amountWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  amount: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "700",
  },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: colors.primary,
    marginLeft: 4,
    borderRadius: 1,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  feeLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  feeValue: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  transferBtn: {
    marginBottom: spacing.md,
  },
  qrCard: {
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.md,
  },
  qrTitle: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  qrHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  keypadWrap: {
    marginTop: 12,
  },
  keypadFab: {
    position: "absolute",
    right: 0,
    bottom: spacing.sm,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  success: {
    color: colors.success,
    fontSize: 13,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
