import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveDevHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    null;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(':')[0] ?? null;
}

export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  if (Platform.OS === 'android') {
    const devHost = resolveDevHost();
    if (devHost && devHost !== 'localhost' && devHost !== '127.0.0.1') {
      return `http://${devHost}:3000`;
    }
    return 'http://10.0.2.2:3000';
  }

  const devHost = resolveDevHost();
  if (devHost) {
    return `http://${devHost}:3000`;
  }

  return 'http://localhost:3000';
}
