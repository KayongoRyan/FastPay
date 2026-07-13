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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Input } from "@/components/ui/Input";
import { NumericKeypad } from "@/components/ui/NumericKeypad";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { RelayStatusResponse } from "@/lib/api/relay";
import type { OfflineQrPayload } from "@/lib/offline/qr-payload";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

type TransferMethod = "phone" | "wallet";
type RelayUiState = "idle" | "polling" | "confirmed" | "failed";

export function TransferPanel() {
  const insets = useSafeAreaInsets();
  const {
    isLoading,
    error,
    prepareOfflinePayment,
    relayOfflinePayment,
    pollRelayStatus,
  } = useWalletStore();

  const [method, setMethod] = useState<TransferMethod>("phone");
  const [amount, setAmount] = useState("1");
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");
  const [qrPayload, setQrPayload] = useState<OfflineQrPayload | null>(null);
  const [relayUiState, setRelayUiState] = useState<RelayUiState>("idle");
  const [relayMessage, setRelayMessage] = useState<string | null>(null);
  const [relayDetails, setRelayDetails] = useState<RelayStatusResponse | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const numericAmount = Number(amount) || 0;
  const fabPadding = keypadOpen ? 0 : 72;
  const scrollBottomPadding = insets.bottom + spacing.xl + fabPadding;

  const onKey = (key: string) => {
    if (key === "*") return;
    setAmount((prev) => `${prev}${key}`.replace(/^0+(?=\d)/, ""));
  };

  const onDelete = () =>
    setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));

  const handleTransfer = async () => {
    setLocalError(null);
    setRelayMessage(null);
    setRelayDetails(null);
    setRelayUiState("idle");

    const stellarDestination = destination.trim();

    if (!stellarDestination.startsWith("G") || stellarDestination.length < 56) {
      setLocalError("Enter a valid recipient wallet address.");
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

    setRelayUiState("polling");
    setRelayMessage("Submitting transfer to the network...");
    setRelayDetails(null);

    try {
      const result = await relayOfflinePayment({
        signedTxXDR: qrPayload.signedTxXDR,
        recipientPhone: qrPayload.recipientPhone,
      });

      const txHash = result.txHash ?? result.queueId;
      setRelayMessage("Transfer queued. Waiting for confirmation...");

      const status = await pollRelayStatus(txHash);
      setRelayDetails(status);

      if (status.status === "confirmed") {
        setRelayUiState("confirmed");
        setRelayMessage("Transfer confirmed.");
      } else {
        setRelayUiState("failed");
        setRelayMessage(status.lastError ?? "Transfer failed.");
      }
    } catch (relayError) {
      setRelayUiState("failed");
      setRelayMessage(
        relayError instanceof Error
          ? relayError.message
          : "Transfer relay failed.",
      );
    }
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: scrollBottomPadding },
        ]}
      >
        <Text style={styles.pageTag}>TRANSFER</Text>
        <Text style={styles.subtitle}>
          Send USDT, BTC, or SOL to a FastPay user or wallet address.
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
              setRelayUiState("idle");
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
              setRelayUiState("idle");
            }}
          />
        </View>

        <View style={styles.amountBadge}>
          <Text style={styles.amountLabel}>Amount (USDT)</Text>
        </View>

        <Pressable
          style={styles.amountWrap}
          onPress={() => setKeypadOpen(true)}
        >
          <Text style={styles.amount}>{numericAmount.toLocaleString()} USDT</Text>
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
          <Text style={styles.feeValue}>~0.50 USDT</Text>
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
              label={
                relayUiState === "polling"
                  ? "Confirming..."
                  : "Relay now"
              }
              onPress={() => void handleRelayNow()}
              loading={isLoading || relayUiState === "polling"}
            />
          </View>
        ) : null}

        {relayMessage ? (
          <View
            style={[
              styles.relayCard,
              relayUiState === "confirmed" && styles.relayCardSuccess,
              relayUiState === "failed" && styles.relayCardFailed,
            ]}
          >
            <Text
              style={[
                styles.relayMessage,
                relayUiState === "confirmed" && styles.relayMessageSuccess,
                relayUiState === "failed" && styles.relayMessageFailed,
              ]}
            >
              {relayMessage}
            </Text>
            {relayDetails?.onChainTxHash ? (
              <Text style={styles.relayMeta}>
                On-chain: {relayDetails.onChainTxHash.slice(0, 12)}…
              </Text>
            ) : null}
          </View>
        ) : null}

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
          style={[styles.keypadFab, { bottom: insets.bottom + spacing.sm }]}
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
  relayCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.md,
  },
  relayCardSuccess: {
    borderColor: "rgba(74,222,128,0.35)",
    backgroundColor: "rgba(74,222,128,0.08)",
  },
  relayCardFailed: {
    borderColor: "rgba(248,113,113,0.35)",
    backgroundColor: "rgba(248,113,113,0.08)",
  },
  relayMessage: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  relayMessageSuccess: {
    color: colors.success,
  },
  relayMessageFailed: {
    color: colors.error,
  },
  relayMeta: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  keypadWrap: {
    marginTop: 12,
  },
  keypadFab: {
    position: "absolute",
    right: 0,
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
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
