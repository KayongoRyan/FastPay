import { CameraView, useCameraPermissions } from "expo-camera";
import { useMemo, useState } from "react";
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
import { Copy, QrCode, ScanLine } from "lucide-react-native";

import { Input } from "@/components/ui/Input";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { decodeOfflineQrPayload } from "@/lib/offline/qr-payload";
import { useWalletStore } from "@/store/walletStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface ReceivePanelProps {
  publicKey: string;
  holderName: string;
}

export function ReceivePanel({ publicKey, holderName }: ReceivePanelProps) {
  const { isLoading, error, relayOfflinePayment } = useWalletStore();
  const isWeb = Platform.OS === "web";
  const [permission, requestPermission] = useCameraPermissions();
  const [manualPayload, setManualPayload] = useState("");
  const [scanning, setScanning] = useState(false);
  const [relayResult, setRelayResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRelay, setShowRelay] = useState(false);

  const receiveQrValue = useMemo(
    () =>
      JSON.stringify({
        v: 1,
        type: "fastpay-receive",
        publicKey,
        name: holderName,
      }),
    [publicKey, holderName],
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
      <Text style={styles.pageTag}>RECEIVE</Text>
      <Text style={styles.subtitle}>
        Share your QR or wallet address so others can pay you.
      </Text>

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <QrCode color={colors.primary} size={22} />
        </View>
        <Text style={styles.heroName}>{holderName}</Text>
        <View style={styles.qrWrap}>
          <QRCode
            value={receiveQrValue}
            size={196}
            backgroundColor="#ffffff"
            color="#08182F"
          />
        </View>
        <Text style={styles.qrHint}>Scan to pay this wallet</Text>
      </View>

      <View style={styles.steps}>
        {[
          "Share your QR or address",
          "Sender completes payment",
          "Funds appear in your wallet",
        ].map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.addressCard}>
        <Text style={styles.addressLabel}>Wallet address</Text>
        <Text style={styles.addressValue} selectable>
          {publicKey}
        </Text>
        <Pressable style={styles.copyBtn} onPress={() => void copyKey()}>
          <Copy color={colors.primary} size={16} />
          <Text style={styles.copyBtnText}>
            {copied ? "Copied" : "Copy address"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.relayToggle}
        onPress={() => setShowRelay((v) => !v)}
      >
        <ScanLine color={colors.white} size={18} />
        <Text style={styles.relayToggleText}>
          {showRelay ? "Hide offline relay" : "Relay offline payment"}
        </Text>
      </Pressable>

      {showRelay ? (
        <View style={styles.relaySection}>
          <Text style={styles.relayHint}>
            Scan a signed payment QR from another device and relay it when
            online.
          </Text>

          {!isWeb && !permission ? (
            <Text style={styles.muted}>Checking camera permission...</Text>
          ) : null}

          {!isWeb && permission && !permission.granted ? (
            <PrimaryButton
              label="Enable camera"
              onPress={() => void requestPermission()}
            />
          ) : null}

          {!isWeb && permission?.granted && scanning ? (
            <View style={styles.cameraWrap}>
              <CameraView
                style={styles.camera}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={({ data }) => {
                  if (!scanning || isLoading) return;
                  void relayPayload(data);
                }}
              />
            </View>
          ) : null}

          {!isWeb && permission?.granted ? (
            <PrimaryButton
              label={scanning ? "Stop scanning" : "Scan payment QR"}
              onPress={() => setScanning((v) => !v)}
            />
          ) : null}

          {isWeb ? (
            <Text style={styles.muted}>
              QR scanning is not available on web. Paste the signed transaction
              JSON below.
            </Text>
          ) : null}

          <Input
            label="Signed transaction JSON"
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
          />

          {relayResult ? <Text style={styles.success}>{relayResult}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  heroCard: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.inputBg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,174,239,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  heroName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.md,
  },
  qrWrap: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
  },
  qrHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.md,
  },
  steps: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,174,239,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  stepText: {
    color: colors.white,
    fontSize: 14,
    flex: 1,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.inputBg,
    marginBottom: spacing.md,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  relayToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  relayToggleText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  relaySection: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  relayHint: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  cameraWrap: {
    height: 240,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  camera: { flex: 1 },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  muted: { color: colors.textMuted, fontSize: 13 },
  success: { color: colors.success, fontSize: 13 },
  error: { color: colors.error, fontSize: 13 },
});
