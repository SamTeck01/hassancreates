"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const EVENT = "hc-draft-change";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/**
 * A draft object persisted in localStorage. Server render (and the first
 * client render) see `null`, so there is no hydration mismatch, and the value
 * updates across tabs.
 */
export function useStoredDraft<T extends object>(
  key: string,
  isValid: (d: T) => boolean
): [T | null, (next: T | null) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try { return localStorage.getItem(key); } catch { return null; }
    },
    () => null
  );

  const draft = useMemo(() => {
    if (!raw) return null;
    try {
      const d = JSON.parse(raw) as T;
      return isValid(d) ? d : null;
    } catch {
      return null;
    }
    // isValid is a static predicate per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const setDraft = useCallback(
    (next: T | null) => {
      try {
        if (next) localStorage.setItem(key, JSON.stringify(next));
        else localStorage.removeItem(key);
      } catch {
        /* storage blocked — draft just won't persist */
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key]
  );

  return [draft, setDraft];
}
