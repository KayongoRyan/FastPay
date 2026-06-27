import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { OfflineQrPayload } from "@/lib/offline/qr-payload";
import { decodeOfflineQrPayload } from "@/lib/offline/qr-payload";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

type PageMode = "send" | "receive";

export default function SendReceiveScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { user, isReady, isLoading } = useRequireAuth();
  const {
    wallet,
    initialize,
    createWallet,
    isLoading: walletLoading,
    isReady: walletReady,
    error,
    prepareOfflinePayment,
    relayOfflinePayment,
  } = useWalletStore();

  const initialMode: PageMode = mode === "send" ? "send" : "receive";
  const [activeMode, setActiveMode] = useState<PageMode>(initialMode);

  useEffect(() => {
    if (user) {
      void initialize();
    }
  }, [user, initialize]);

  useEffect(() => {
    if (mode === "send" || mode === "receive") {
      setActiveMode(mode);
    }
  }, [mode]);

  if (!isReady || isLoading || !user) {
    return (
      <TabScreenLayout scroll={false}>
        <Text style={styles.muted}>Loading...</Text>
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout>
      <BackHeader title="Receive & Send" />

      <View style={styles.segment}>
        <SegmentButton
          label="Receive"
          icon={ArrowDownLeft}
          active={activeMode === "receive"}
          onPress={() => setActiveMode("receive")}
        />
        <SegmentButton
          label="Send"
          icon={ArrowUpRight}
          active={activeMode === "send"}
          onPress={() => setActiveMode("send")}
        />
      </View>

      {!walletReady ? (
        <Text style={styles.muted}>Loading wallet...</Text>
      ) : !wallet ? (
        <View style={styles.emptyWallet}>
          <Text style={styles.emptyText}>
            Create a Stellar wallet to send and receive funds.
          </Text>
          <PrimaryButton
            label={walletLoading ? "Creating..." : "Create wallet"}
            onPress={() => void createWallet()}
            loading={walletLoading}
          />
        </View>
      ) : activeMode === "receive" ? (
        <ReceivePanel publicKey={wallet.publicKey} />
      ) : (
        <SendPanel
          isLoading={walletLoading}
          error={error}
          prepareOfflinePayment={prepareOfflinePayment}
          relayOfflinePayment={relayOfflinePayment}
        />
      )}
    </TabScreenLayout>
  );
}

interface SegmentButtonProps {
  label: string;
  icon: typeof ArrowDownLeft;
  active: boolean;
  onPress: () => void;
}

function SegmentButton({ label, icon: Icon, active, onPress }: SegmentButtonProps) {
  return (
    <Pressable
      style={[styles.segmentBtn, active && styles.segmentBtnActive]}
      onPress={onPress}
    >
      <Icon color={active ? colors.primary : colors.textMuted} size={18} />
      <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ReceivePanel({ publicKey }: { publicKey: string }) {
  const { isLoading, error, relayOfflinePayment } = useWalletStore();
  const isWeb = Platform.OS === "web";
  const [permission, requestPermission] = useCameraPermissions();
  const [manualPayload, setManualPayload] = useState("");
  const [scanning, setScanning] = useState(false);
  const [relayResult, setRelayResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const receiveQrValue = useMemo(
    () => JSON.stringify({ v: 1, type: "fastpay-receive", publicKey }),
    [publicKey],
  );

  const relayPayload = async (raw: string) => {
    const payload = decodeOfflineQrPayload(raw);
    const result = await relayOfflinePayment({
      signedTxXDR: payload.signedTxXDR,
      recipientPhone: payload.recipientPhone,
    });
    setRelayResult(`Payment relayed — queue ${result.queueId}`);
    setScanning(false);
  };

  const copyKey = async () => {
    await Clipboard.setStringAsync(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionHint}>
        Share your QR or wallet address to receive payments.
      </Text>

      <View style={styles.qrCard}>
        <QRCode value={receiveQrValue} size={200} backgroundColor="#ffffff" color="#08182F" />
        <Text style={styles.qrCaption}>Scan to pay this wallet</Text>
      </View>

      <View style={styles.addressBox}>
        <Text style={styles.addressLabel}>Wallet address</Text>
        <Text style={styles.addressValue} selectable>
          {publicKey}
        </Text>
        <Pressable style={styles.copyBtn} onPress={() => void copyKey()}>
          <Text style={styles.copyBtnText}>{copied ? "Copied" : "Copy address"}</Text>
        </Pressable>
      </View>

      <Text style={styles.dividerLabel}>Scan incoming payment</Text>
      <Text style={styles.sectionHint}>
        Scan a signed payment QR from another device and relay it when online.
      </Text>

      {!isWeb && !permission ? (
        <Text style={styles.muted}>Checking camera permission...</Text>
      ) : null}

      {!isWeb && permission && !permission.granted ? (
        <PrimaryButton
          label="Enable camera"
          onPress={() => void requestPermission()}
          style={styles.blockBtn}
        />
      ) : null}

      {!isWeb && permission?.granted && scanning ? (
        <View style={styles.cameraWrap}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }) => {
              if (!scanning || isLoading) {
                return;
              }
              void relayPayload(data);
            }}
          />
        </View>
      ) : null}

      {!isWeb && permission?.granted ? (
        <PrimaryButton
          label={scanning ? "Stop scanning" : "Scan payment QR"}
          onPress={() => setScanning((v) => !v)}
          style={styles.blockBtn}
        />
      ) : null}

      {isWeb ? (
        <Text style={styles.muted}>
          QR scanning is not available on web. Paste the signed transaction JSON below.
        </Text>
      ) : null}

      <Input
        label="Or paste signed transaction JSON"
        value={manualPayload}
        onChangeText={setManualPayload}
        multiline
        placeholder='{"v":1,"signedTxXDR":"..."}'
        style={styles.multilineInput}
      />

      <PrimaryButton
        label="Relay payment"
        onPress={() => void relayPayload(manualPayload.trim())}
        loading={isLoading}
        disabled={!manualPayload.trim()}
        style={styles.blockBtn}
      />

      {relayResult ? <Text style={styles.success}>{relayResult}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

interface SendPanelProps {
  isLoading: boolean;
  error: string | null;
  prepareOfflinePayment: (params: {
    destination: string;
    amount: string;
    recipientPhone?: string;
  }) => Promise<{ signedTxXDR: string; recipientPhone?: string }>;
  relayOfflinePayment: (params: {
    signedTxXDR: string;
    recipientPhone?: string;
  }) => Promise<{ queueId: string; estimatedSeconds: number }>;
}

function SendPanel({
  isLoading,
  error,
  prepareOfflinePayment,
  relayOfflinePayment,
}: SendPanelProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("1");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [qrPayload, setQrPayload] = useState<OfflineQrPayload | null>(null);
  const [relayResult, setRelayResult] = useState<string | null>(null);

  const handlePrepare = async () => {
    const prepared = await prepareOfflinePayment({
      destination: destination.trim(),
      amount: amount.trim(),
      recipientPhone: recipientPhone.trim() || undefined,
    });

    setQrPayload({
      v: 1,
      signedTxXDR: prepared.signedTxXDR,
      recipientPhone: prepared.recipientPhone,
    });
    setRelayResult(null);
  };

  const handleRelayNow = async () => {
    if (!qrPayload) {
      return;
    }

    const result = await relayOfflinePayment({
      signedTxXDR: qrPayload.signedTxXDR,
      recipientPhone: qrPayload.recipientPhone,
    });

    setRelayResult(`Queued ${result.queueId} (~${result.estimatedSeconds}s)`);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionHint}>
        Sign a payment offline, share the QR, or relay immediately when online.
      </Text>

      <Input
        label="Destination public key"
        value={destination}
        onChangeText={setDestination}
        placeholder="G..."
        autoCapitalize="characters"
      />

      <Input
        label="Amount (XLM)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="1"
      />

      <Input
        label="Recipient phone (optional)"
        value={recipientPhone}
        onChangeText={setRecipientPhone}
        keyboardType="phone-pad"
        placeholder="+250 7XX XXX XXX"
      />

      <PrimaryButton
        label="Sign & show QR"
        onPress={() => void handlePrepare()}
        loading={isLoading}
        disabled={!destination.trim() || !amount.trim()}
        style={styles.blockBtn}
      />

      {qrPayload ? (
        <View style={styles.qrCard}>
          <QRCode
            value={JSON.stringify(qrPayload)}
            size={200}
            backgroundColor="#ffffff"
            color="#08182F"
          />
          <Text style={styles.qrCaption}>Share this QR for offline relay</Text>
          <PrimaryButton
            label="Relay now (online)"
            onPress={() => void handleRelayNow()}
            loading={isLoading}
            style={styles.blockBtn}
          />
        </View>
      ) : null}

      {relayResult ? <Text style={styles.success}>{relayResult}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.textMuted },
  segment: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    backgroundColor: colors.inputBg,
    borderRadius: radius.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.pill,
  },
  segmentBtnActive: {
    backgroundColor: "rgba(0,174,239,0.15)",
  },
  segmentLabel: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
  segmentLabelActive: {
    color: colors.primary,
  },
  emptyWallet: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  qrCard: {
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.md,
  },
  qrCaption: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.md,
  },
  addressBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.lg,
  },
  addressLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  addressValue: {
    color: colors.white,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  copyBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  copyBtnText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  dividerLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  cameraWrap: {
    height: 260,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  camera: {
    flex: 1,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  blockBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  success: {
    color: colors.success,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
