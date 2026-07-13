import { Href, router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  XCircle,
} from "lucide-react-native";

import { BackHeader } from "@/components/ui/BackHeader";
import { usePreventScreenCapture } from "@/hooks/usePreventScreenCapture";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import {
  fetchKycStatus,
  uploadKycDocument,
  type UploadKycDocumentResponse,
} from "@/lib/api/kyc";
import {
  captureDocumentFromCamera,
  defaultIssueDate,
  pickDocumentFromGallery,
  requestCapturePermissions,
  validateCapturedDocument,
} from "@/lib/kyc/document-capture";
import {
  ID_TYPE_OPTIONS,
  POA_TYPE_OPTIONS,
  type CapturedDocument,
  type IdSubtype,
  type KycStep,
  type PoaType,
} from "@/lib/kyc/types";
import { useAuthStore } from "@/store/authStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

function StatusBadge({
  status,
  reason,
  score,
}: {
  status?: string;
  reason?: string;
  score?: number;
}) {
  if (!status) {
    return <Text style={styles.meta}>Not uploaded</Text>;
  }

  const approved = status === "approved";
  const rejected = status === "rejected";

  return (
    <View style={styles.statusBlock}>
      <View style={styles.statusRow}>
        {approved ? (
          <CheckCircle2 color={colors.success} size={16} />
        ) : rejected ? (
          <XCircle color={colors.error} size={16} />
        ) : (
          <ActivityIndicator color={colors.primary} size="small" />
        )}
        <Text
          style={[
            styles.statusText,
            approved && styles.statusApproved,
            rejected && styles.statusRejected,
          ]}
        >
          {approved ? "Approved" : rejected ? "Rejected" : "Pending review"}
        </Text>
        {score !== undefined ? (
          <Text style={styles.score}>{Math.round(score * 100)}% match</Text>
        ) : null}
      </View>
      {reason ? <Text style={styles.reason}>{reason}</Text> : null}
    </View>
  );
}

export default function KycScreen() {
  usePreventScreenCapture();
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const user = useAuthStore((s) => s.user);
  const initializeAuth = useAuthStore((s) => s.initialize);

  const [step, setStep] = useState<KycStep>("select_id_type");
  const [idSubtype, setIdSubtype] = useState<IdSubtype | null>(null);
  const [poaType, setPoaType] = useState<PoaType | null>(null);
  const [holderName, setHolderName] = useState(user?.fullName ?? "");
  const [issueDate, setIssueDate] = useState(defaultIssueDate());
  const [idCapture, setIdCapture] = useState<CapturedDocument | null>(null);
  const [poaCapture, setPoaCapture] = useState<CapturedDocument | null>(null);
  const [idResult, setIdResult] = useState<UploadKycDocumentResponse | null>(null);
  const [poaResult, setPoaResult] = useState<UploadKycDocumentResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmitId = Boolean(idSubtype && idCapture && holderName.trim());
  const canSubmitPoa = Boolean(
    poaType && poaCapture && holderName.trim() && issueDate.trim(),
  );

  const kycVerified = useMemo(
    () =>
      idResult?.verificationStatus === "approved" &&
      poaResult?.verificationStatus === "approved",
    [idResult, poaResult],
  );

  const captureFor = async (
    target: "id" | "poa",
    mode: "camera" | "gallery",
  ) => {
    setError(null);
    const granted = await requestCapturePermissions();
    if (!granted) {
      setError("Camera or photo library permission is required.");
      return;
    }

    const captured =
      mode === "camera"
        ? await captureDocumentFromCamera()
        : await pickDocumentFromGallery();
    const validationError = validateCapturedDocument(captured);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!captured) {
      return;
    }

    if (target === "id") {
      setIdCapture(captured);
      setIdResult(null);
    } else {
      setPoaCapture(captured);
      setPoaResult(null);
    }
  };

  const submitId = async () => {
    if (!idSubtype || !idCapture) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await uploadKycDocument({
        documentType: "id_card",
        idSubtype,
        fileName: idCapture.fileName,
        contentBase64: idCapture.contentBase64,
        holderName: holderName.trim(),
      });
      setIdResult(result);
      if (result.verificationStatus === "approved") {
        setStep("scan_poa");
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "ID upload failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const submitPoa = async () => {
    if (!poaType || !poaCapture) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await uploadKycDocument({
        documentType: "proof_of_address",
        poaType,
        fileName: poaCapture.fileName,
        contentBase64: poaCapture.contentBase64,
        holderName: holderName.trim(),
        issueDate: issueDate.trim(),
      });
      setPoaResult(result);
      setStep("review");
      await fetchKycStatus();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "POA upload failed",
      );
    } finally {
      setBusy(false);
    }
  };

  const onComplete = async () => {
    await initializeAuth();
    resetOnboarding();
    router.replace("/home" as Href);
  };

  return (
    <Screen scroll>
      <BackHeader
        title={
          step === "select_id_type"
            ? "Select ID type"
            : step === "scan_id"
              ? "Scan your ID"
              : step === "scan_poa"
                ? "Proof of address"
                : "Verification review"
        }
      />

      {step === "select_id_type" ? (
        <>
          <Text style={styles.body}>
            Choose the document you will scan. We verify photo quality, name
            match, and document framing automatically.
          </Text>
          {ID_TYPE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={[
                styles.card,
                idSubtype === option.id && styles.cardSelected,
              ]}
              onPress={() => setIdSubtype(option.id)}
            >
              <View style={styles.cardIcon}>
                <FileText color={colors.white} size={22} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{option.label}</Text>
                <Text style={styles.cardMeta}>{option.hint}</Text>
              </View>
              <ChevronRight color={colors.textMuted} size={22} />
            </Pressable>
          ))}
          <PrimaryButton
            label="Continue"
            disabled={!idSubtype}
            onPress={() => setStep("scan_id")}
          />
        </>
      ) : null}

      {step === "scan_id" ? (
        <>
          <Text style={styles.body}>
            Capture your{" "}
            {ID_TYPE_OPTIONS.find((item) => item.id === idSubtype)?.label}.
            Place the document flat, avoid glare, and keep all edges visible.
          </Text>

          <Text style={styles.fieldLabel}>Name on document</Text>
          <TextInput
            style={styles.input}
            value={holderName}
            onChangeText={setHolderName}
            placeholder="Must match your account name"
            placeholderTextColor={colors.textSubtle}
          />

          {idCapture ? (
            <Image source={{ uri: idCapture.uri }} style={styles.preview} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Camera color={colors.textMuted} size={32} />
              <Text style={styles.previewText}>No photo yet</Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => void captureFor("id", "camera")}
              disabled={busy}
            >
              <Camera color={colors.white} size={18} />
              <Text style={styles.secondaryBtnText}>Scan with camera</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => void captureFor("id", "gallery")}
              disabled={busy}
            >
              <ImageIcon color={colors.white} size={18} />
              <Text style={styles.secondaryBtnText}>Choose photo</Text>
            </Pressable>
          </View>

          <StatusBadge
            status={idResult?.verificationStatus}
            reason={idResult?.rejectionReason}
            score={idResult?.confidenceScore}
          />

          <PrimaryButton
            label={idResult?.verificationStatus === "approved" ? "Next" : "Verify ID"}
            loading={busy}
            disabled={!canSubmitId}
            onPress={() =>
              idResult?.verificationStatus === "approved"
                ? setStep("scan_poa")
                : void submitId()
            }
          />
        </>
      ) : null}

      {step === "scan_poa" ? (
        <>
          <Text style={styles.body}>
            Upload a recent proof-of-address dated within the last 90 days.
          </Text>

          <Text style={styles.fieldLabel}>Document type</Text>
          <View style={styles.optionGrid}>
            {POA_TYPE_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.chip,
                  poaType === option.id && styles.chipSelected,
                ]}
                onPress={() => setPoaType(option.id)}
              >
                <Text style={styles.chipText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Issue date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={issueDate}
            onChangeText={setIssueDate}
            placeholder="2026-07-01"
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>Name on document</Text>
          <TextInput
            style={styles.input}
            value={holderName}
            onChangeText={setHolderName}
            placeholder="Must match your account name"
            placeholderTextColor={colors.textSubtle}
          />

          {poaCapture ? (
            <Image source={{ uri: poaCapture.uri }} style={styles.preview} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <FileText color={colors.textMuted} size={32} />
              <Text style={styles.previewText}>No document yet</Text>
            </View>
          )}

          <View style={styles.actionRow}>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => void captureFor("poa", "camera")}
              disabled={busy}
            >
              <Camera color={colors.white} size={18} />
              <Text style={styles.secondaryBtnText}>Scan document</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => void captureFor("poa", "gallery")}
              disabled={busy}
            >
              <ImageIcon color={colors.white} size={18} />
              <Text style={styles.secondaryBtnText}>Choose photo</Text>
            </Pressable>
          </View>

          <PrimaryButton
            label="Verify proof of address"
            loading={busy}
            disabled={!canSubmitPoa}
            onPress={() => void submitPoa()}
          />
        </>
      ) : null}

      {step === "review" ? (
        <>
          <Text style={styles.body}>
            Both documents must be approved before you can continue.
          </Text>

          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>ID document</Text>
            <StatusBadge
              status={idResult?.verificationStatus}
              reason={idResult?.rejectionReason}
              score={idResult?.confidenceScore}
            />
            {idResult?.verificationStatus === "rejected" ? (
              <Pressable onPress={() => setStep("scan_id")}>
                <Text style={styles.link}>Retake ID photo</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.reviewCard}>
            <Text style={styles.reviewTitle}>Proof of address</Text>
            <StatusBadge
              status={poaResult?.verificationStatus}
              reason={poaResult?.rejectionReason}
              score={poaResult?.confidenceScore}
            />
            {poaResult?.verificationStatus === "rejected" ? (
              <Pressable onPress={() => setStep("scan_poa")}>
                <Text style={styles.link}>Retake POA photo</Text>
              </Pressable>
            ) : null}
          </View>

          <PrimaryButton
            label="Continue to Home"
            disabled={!kycVerified}
            onPress={() => void onComplete()}
          />
        </>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.lg,
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
  cardSelected: {
    borderColor: colors.primary,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
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
  fieldLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.inputBg,
    color: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
  },
  previewPlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  previewText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 12,
    backgroundColor: colors.inputBg,
  },
  secondaryBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.inputBg,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,174,239,0.12)",
  },
  chipText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "500",
  },
  statusBlock: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  statusApproved: { color: colors.success },
  statusRejected: { color: colors.error },
  score: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: "auto",
  },
  reason: {
    color: colors.error,
    fontSize: 13,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
  },
  reviewTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  link: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  error: {
    color: colors.error,
    marginTop: spacing.md,
    fontSize: 13,
  },
});
