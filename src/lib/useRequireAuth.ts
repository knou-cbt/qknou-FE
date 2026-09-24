"use client";

import { useCallback } from "react";

import { useAuth } from "@/contexts";
import { showLoginPrompt } from "./loginPrompt";
import { POST_LOGIN_REDIRECT_KEY } from "./auth-token";

export { POST_LOGIN_REDIRECT_KEY };

/** 로그인돼 있으면 action 실행, 아니면 로그인 안내 모달 노출(확인 시 /auth/login) */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();

  return useCallback(
    (action: () => void) => {
      if (isAuthenticated) {
        action();
        return;
      }
      showLoginPrompt();
    },
    [isAuthenticated]
  );
}
