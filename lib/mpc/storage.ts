import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { MpcProviderType } from './types';

const SECRET_KEY = 'fastpay_mpc_secret_key';
const PROVIDER_KEY = 'fastpay_mpc_provider';

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function saveSecretKey(secretKey: string): Promise<void> {
  await setSecureItem(SECRET_KEY, secretKey);
}

export async function loadSecretKey(): Promise<string | null> {
  return getSecureItem(SECRET_KEY);
}

export async function clearSecretKey(): Promise<void> {
  await deleteSecureItem(SECRET_KEY);
}

export async function saveProviderType(type: MpcProviderType): Promise<void> {
  await AsyncStorage.setItem(PROVIDER_KEY, type);
}

export async function loadProviderType(): Promise<MpcProviderType | null> {
  const value = await AsyncStorage.getItem(PROVIDER_KEY);
  if (value === 'single-key' || value === 'web3auth') {
    return value;
  }

  return null;
}

export async function clearProviderType(): Promise<void> {
  await AsyncStorage.removeItem(PROVIDER_KEY);
}
