import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { decodeOfflineQrPayload } from "@/lib/offline/qr-payload";
import { useWalletStore } from "@/store/walletStore";

export default function OfflineReceiveScreen() {
  const { isLoading, error, relayOfflinePayment } = useWalletStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualPayload, setManualPayload] = useState("");
  const [scanning, setScanning] = useState(true);
  const [relayResult, setRelayResult] = useState<string | null>(null);

  const relayPayload = async (raw: string) => {
    const payload = decodeOfflineQrPayload(raw);
    const result = await relayOfflinePayment({
      signedTxXDR: payload.signedTxXDR,
      recipientPhone: payload.recipientPhone,
    });
    setRelayResult(`Relay accepted: ${result.queueId}`);
    setScanning(false);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Camera access is required to scan offline payment QR codes.</Text>
        <Pressable style={styles.button} onPress={() => void requestPermission()}>
          <Text style={styles.buttonText}>Grant camera access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Offline Receive</Text>
      <Text style={styles.subtitle}>
        Scan a signed transaction QR and relay it when this device is online.
      </Text>

      {scanning ? (
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
      ) : (
        <Pressable style={styles.buttonSecondary} onPress={() => setScanning(true)}>
          <Text style={styles.buttonSecondaryText}>Scan another QR</Text>
        </Pressable>
      )}

      <Text style={styles.label}>Or paste QR JSON manually</Text>
      <TextInput
        style={styles.input}
        placeholder='{"v":1,"signedTxXDR":"..."}'
        placeholderTextColor="#737373"
        multiline
        value={manualPayload}
        onChangeText={setManualPayload}
      />
      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        disabled={isLoading || !manualPayload.trim()}
        onPress={() => void relayPayload(manualPayload.trim())}
      >
        <Text style={styles.buttonText}>Relay pasted payload</Text>
      </Pressable>

      {relayResult ? <Text style={styles.success}>{relayResult}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#0a0a0a",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  subtitle: {
    color: "#a3a3a3",
  },
  cameraWrap: {
    height: 280,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#262626",
  },
  camera: {
    flex: 1,
  },
  label: {
    color: "#737373",
    marginTop: 8,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#0a0a0a",
    fontWeight: "600",
  },
  buttonSecondaryText: {
    color: "#e5e5e5",
    fontWeight: "600",
  },
  success: {
    color: "#4ade80",
  },
  error: {
    color: "#f87171",
  },
});
