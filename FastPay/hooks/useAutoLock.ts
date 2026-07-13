import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuthStore } from '@/store/authStore';

const AUTO_LOCK_MS = 5 * 60 * 1000;

export function useAutoLock() {
  const backgroundAt = useRef<number | null>(null);
  const user = useAuthStore((s) => s.user);
  const isLocked = useAuthStore((s) => s.isLocked);
  const setLocked = useAuthStore.setState;

  useEffect(() => {
    if (!user) return;

    const onChange = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        backgroundAt.current = Date.now();
        return;
      }

      if (state === 'active' && backgroundAt.current && !isLocked) {
        const elapsed = Date.now() - backgroundAt.current;
        if (elapsed >= AUTO_LOCK_MS) {
          setLocked({ isLocked: true });
        }
      }
      backgroundAt.current = null;
    };

    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [user, isLocked]);
}
