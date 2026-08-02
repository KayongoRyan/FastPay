import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { PortalKind, PortalTokens, PortalUser } from "./types";

function keys(kind: PortalKind) {
  const prefix = kind === "merchant" ? "fastpay_merchant" : "fastpay_business";
  return {
    access: `${prefix}_access_token`,
    refresh: `${prefix}_refresh_token`,
    user: `${prefix}_user`,
  };
}

async function setSecure(key: string, value: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getSecure(key: string) {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecure(key: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function savePortalSession(
  kind: PortalKind,
  user: PortalUser,
  tokens: PortalTokens,
) {
  const k = keys(kind);
  await setSecure(k.access, tokens.accessToken);
  await setSecure(k.refresh, tokens.refreshToken);
  await AsyncStorage.setItem(k.user, JSON.stringify(user));
}

export async function loadPortalAccessToken(kind: PortalKind) {
  return getSecure(keys(kind).access);
}

export async function loadPortalRefreshToken(kind: PortalKind) {
  return getSecure(keys(kind).refresh);
}

export async function loadPortalUser(kind: PortalKind): Promise<PortalUser | null> {
  const raw = await AsyncStorage.getItem(keys(kind).user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalUser;
  } catch {
    return null;
  }
}

export async function clearPortalSession(kind: PortalKind) {
  const k = keys(kind);
  await Promise.all([
    deleteSecure(k.access),
    deleteSecure(k.refresh),
    AsyncStorage.removeItem(k.user),
  ]);
}

export function isTokenExpired(accessToken: string, skewMs = 30_000): boolean {
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1] ?? "")) as {
      exp?: number;
    };
    if (typeof payload.exp !== "number") return true;
    return Date.now() >= payload.exp * 1000 - skewMs;
  } catch {
    return true;
  }
}
