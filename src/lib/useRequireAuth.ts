"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts";
import { POST_LOGIN_REDIRECT_KEY } from "./auth-token";

export { POST_LOGIN_REDIRECT_KEY };

/** 로그인돼 있으면 action 실행, 아니면 로그인 유도(현재 경로 저장 후 /auth/login) */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  return useCallback(
    (action: () => void) => {
      if (isAuthenticated) {
        action();
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          POST_LOGIN_REDIRECT_KEY,
          window.location.pathname + window.location.search
        );
      }
      router.push("/auth/login");
    },
    [isAuthenticated, router]
  );
}
