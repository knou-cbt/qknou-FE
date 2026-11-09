"use client";

import { useCallback, useSyncExternalStore } from "react";

/** localStorage 값: 해설이 잠금 해제된 만료 시각(ms) */
const STORAGE_KEY = "qknou:explanation:unlockedUntil";
const UNLOCK_DURATION_MS = 30 * 60 * 1000;

/** localStorage를 못 쓰는 환경(시크릿 모드 등)에서도 현재 탭에서는 풀리도록 메모리에도 둔다 */
let memoryUnlockedUntil = 0;

function readUnlockedUntil(): number {
  if (typeof window === "undefined") return 0;
  try {
    const until = Number(localStorage.getItem(STORAGE_KEY));
    return Math.max(Number.isFinite(until) ? until : 0, memoryUnlockedUntil);
  } catch {
    return memoryUnlockedUntil;
  }
}

/**
 * 해설 게이트·하단 배너·애드센스·공유 진입 모달이 모두 같은 잠금 상태를 봐야 해서
 * 컴포넌트별 useState가 아니라 모듈 단위 스토어로 둔다. 잠금 해제 시점과 만료 시점에
 * 구독자 전체에 알려서, 버튼을 누르는 즉시 광고가 사라지고 30분 뒤 다시 나타난다.
 */
const listeners = new Set<() => void>();
let expiryTimer: number | undefined;

function notify() {
  listeners.forEach((listener) => listener());
}

function scheduleExpiry() {
  window.clearTimeout(expiryTimer);
  const remaining = readUnlockedUntil() - Date.now();
  if (remaining > 0) expiryTimer = window.setTimeout(notify, remaining);
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  scheduleExpiry();
  notify();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    window.addEventListener("storage", onStorage);
    scheduleExpiry();
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      window.clearTimeout(expiryTimer);
    }
  };
}

function getSnapshot(): boolean {
  return readUnlockedUntil() > Date.now();
}

/** SSR·하이드레이션 단계에서는 항상 잠김으로 렌더하고, 이후 localStorage 값으로 동기화된다 */
function getServerSnapshot(): boolean {
  return false;
}

/** 광고 시청 후 30분 동안 해설을 무제한으로 보고, 그동안 광고를 숨기는 전역(기기 단위) 잠금 상태 */
export function useExplanationUnlock() {
  const isUnlocked = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const unlockFor30Min = useCallback(() => {
    const until = Date.now() + UNLOCK_DURATION_MS;
    memoryUnlockedUntil = until;
    try {
      localStorage.setItem(STORAGE_KEY, String(until));
    } catch {
      // ignore
    }
    scheduleExpiry();
    notify();
  }, []);

  return { isUnlocked, unlockFor30Min };
}
