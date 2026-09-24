"use client";

import { useCallback, useState } from "react";

/** localStorage 값: 해설이 잠금 해제된 만료 시각(ms) */
const STORAGE_KEY = "qknou:explanation:unlockedUntil";
const UNLOCK_DURATION_MS = 30 * 60 * 1000;

function readUnlockedUntil(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const until = Number(raw);
    return Number.isFinite(until) ? until : 0;
  } catch {
    return 0;
  }
}

/**
 * 광고 시청 후 30분 동안 해설을 무제한으로 볼 수 있게 하는 전역(기기 단위) 잠금 상태.
 * SSR에서는 항상 잠김 상태로 렌더 후, 마운트 시 localStorage 값으로 동기화한다.
 */
export function useExplanationUnlock() {
  const [isUnlocked, setIsUnlocked] = useState(() => readUnlockedUntil() > Date.now());

  const unlockFor30Min = useCallback(() => {
    const until = Date.now() + UNLOCK_DURATION_MS;
    try {
      localStorage.setItem(STORAGE_KEY, String(until));
    } catch {
      // ignore
    }
    setIsUnlocked(true);
  }, []);

  return { isUnlocked, unlockFor30Min };
}
