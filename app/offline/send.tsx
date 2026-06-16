import { Link } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import type { OfflineQrPayload } from "@/lib/offline/qr-payload";
import { useWalletStore } from "@/store/walletStore";

export default function OfflineSendScreen() {
  const { wallet, isLoading, error, prepareOfflinePayment, relayOfflinePayment } =
    useWalletStore();
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

  if (!wallet) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Create a wallet on the home screen first.</Text>
        <Link href="/" style={styles.link}>
          Go home
        </Link>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Offline Send</Text>
      <Text style={styles.subtitle}>
        Sign while offline, share via QR, relay when online.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Destination public key (G...)"
        placeholderTextColor="#737373"
        autoCapitalize="characters"
        value={destination}
        onChangeText={setDestination}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount (XLM)"
        placeholderTextColor="#737373"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Recipient phone (optional)"
        placeholderTextColor="#737373"
        value={recipientPhone}
        onChangeText={setRecipientPhone}
      />

      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        disabled={isLoading || !destination || !amount}
        onPress={() => void handlePrepare()}
      >
        <Text style={styles.buttonText}>Sign & show QR</Text>
      </Pressable>

      {qrPayload ? (
        <View style={styles.qrCard}>
          <QRCode
            value={JSON.stringify(qrPayload)}
            size={220}
            backgroundColor="#ffffff"
            color="#0a0a0a"
          />
          <Pressable
            style={[styles.buttonSecondary, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
            onPress={() => void handleRelayNow()}
          >
            <Text style={styles.buttonSecondaryText}>Relay now (online)</Text>
          </Pressable>
        </View>
      ) : null}

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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#ffffff",
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
    marginTop: 16,
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
  qrCard: {
    alignItems: "center",
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262626",
  },
  success: {
    color: "#4ade80",
  },
  error: {
    color: "#f87171",
  },
  link: {
    color: "#ffffff",
    marginTop: 12,
  },
});
