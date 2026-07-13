import { useEffect } from 'react';

let ScreenCapture: {
  preventScreenCaptureAsync: () => Promise<void>;
  allowScreenCaptureAsync: () => Promise<void>;
} | null = null;

try {
  // Optional dependency — install with: npx expo install expo-screen-capture
  ScreenCapture = require('expo-screen-capture');
} catch {
  ScreenCapture = null;
}

export function usePreventScreenCapture(enabled = true) {
  useEffect(() => {
    if (!enabled || !ScreenCapture) return;

    void ScreenCapture.preventScreenCaptureAsync();
    return () => {
      void ScreenCapture?.allowScreenCaptureAsync();
    };
  }, [enabled]);
}
