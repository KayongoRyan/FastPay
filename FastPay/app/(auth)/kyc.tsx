import { Href, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, CreditCard, FileText } from "lucide-react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { Screen } from "@/components/ui/Screen";
import { uploadKycDocument, type KycDocumentType } from "@/lib/api/kyc";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

const PLACEHOLDER_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HwAHggJ/PchI7wAAAABJRU5ErkJggg==";

export default function KycScreen() {
  const reset = useOnboardingStore((s) => s.reset);
  const [uploading, setUploading] = useState<KycDocumentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Record<KycDocumentType, boolean>>({
    id_card: false,
    proof_of_address: false,
  });

  const uploadDocument = async (documentType: KycDocumentType) => {
    setUploading(documentType);
    setError(null);

    try {
      await uploadKycDocument({
        documentType,
        fileName: `${documentType}.png`,
        contentBase64: PLACEHOLDER_PNG_BASE64,
      });
      setUploaded((prev) => ({ ...prev, [documentType]: true }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload failed",
      );
    } finally {
      setUploading(null);
    }
  };

  const onComplete = () => {
    reset();
    router.replace("/home" as Href);
  };

  const canFinish =
    uploaded.id_card && uploaded.proof_of_address && !uploading;

  return (
    <Screen scroll>
      <BackHeader title="Select your ID type" />

      <Text style={styles.body}>
        Upload your ID and proof of address to verify your identity.
      </Text>

      <Pressable
        style={styles.card}
        onPress={() => void uploadDocument("id_card")}
        disabled={Boolean(uploading)}
      >
        <View style={styles.cardIcon}>
          <CreditCard color={colors.white} size={22} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>ID Card</Text>
          <Text style={styles.cardMeta}>
            {uploaded.id_card ? "Uploaded" : "Tap to upload"}
          </Text>
        </View>
        {uploading === "id_card" ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <ChevronRight color={colors.textMuted} size={22} />
        )}
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => void uploadDocument("proof_of_address")}
        disabled={Boolean(uploading)}
      >
        <View style={styles.cardIcon}>
          <FileText color={colors.white} size={22} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardLabel}>Proof of Address</Text>
          <Text style={styles.cardMeta}>
            {uploaded.proof_of_address ? "Uploaded" : "Tap to upload"}
          </Text>
        </View>
        {uploading === "proof_of_address" ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <ChevronRight color={colors.textMuted} size={22} />
        )}
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.finishBtn, !canFinish && styles.finishBtnDisabled]}
        onPress={onComplete}
        disabled={!canFinish}
      >
        <Text style={styles.finishText}>Continue to Home</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xl,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
    gap: spacing.md,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  cardMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  error: {
    color: colors.error,
    marginBottom: spacing.md,
  },
  finishBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  finishBtnDisabled: {
    opacity: 0.45,
  },
  finishText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
});
