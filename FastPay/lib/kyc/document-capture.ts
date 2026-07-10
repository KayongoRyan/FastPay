import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

import type { CapturedDocument } from "./types";

const MIN_BYTES = 20_000;

export async function requestCapturePermissions(): Promise<boolean> {
  if (Platform.OS === "web") {
    return true;
  }

  const camera = await ImagePicker.requestCameraPermissionsAsync();
  const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return camera.granted || library.granted;
}

export async function captureDocumentFromCamera(): Promise<CapturedDocument | null> {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.85,
    base64: true,
    allowsEditing: true,
    aspect: [16, 10],
  });

  return parsePickerResult(result);
}

export async function pickDocumentFromGallery(): Promise<CapturedDocument | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.85,
    base64: true,
    allowsEditing: true,
    aspect: [16, 10],
  });

  return parsePickerResult(result);
}

function parsePickerResult(
  result: ImagePicker.ImagePickerResult,
): CapturedDocument | null {
  if (result.canceled || !result.assets[0]?.base64) {
    return null;
  }

  const asset = result.assets[0];
  const contentBase64 = asset.base64 ?? "";
  const byteLength = estimateBase64Bytes(contentBase64);
  const extension =
    asset.mimeType?.includes("png") || asset.uri.toLowerCase().endsWith(".png")
      ? "png"
      : "jpg";

  return {
    uri: asset.uri,
    fileName: asset.fileName ?? `document.${extension}`,
    contentBase64,
    byteLength,
  };
}

function estimateBase64Bytes(base64: string): number {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

export function validateCapturedDocument(
  document: CapturedDocument | null,
): string | null {
  if (!document) {
    return "No image selected.";
  }
  if (document.byteLength < MIN_BYTES) {
    return "Photo is too small. Retake in brighter light and fill the frame.";
  }
  return null;
}

export function formatIssueDateForApi(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function defaultIssueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return formatIssueDateForApi(date);
}
