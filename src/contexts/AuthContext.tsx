"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, AuthState } from "@/types/auth";
import { decodeToken, isTokenExpired } from "@/utils/jwt";
import { TOKEN_KEY, POST_LOGIN_REDIRECT_KEY } from "@/lib/auth-token";
import { setUnauthorizedHandler } from "@/lib/api-client";
import { toast } from "@/components/ui/toast";

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // SSR 호환을 위해 mounted 상태 추가
  const [mounted, setMounted] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: true,
  });

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 초기 로드 시 토큰 확인
  useEffect(() => {
    if (!mounted) return;
    
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);

        if (storedToken) {
          // 토큰 만료 확인
          if (isTokenExpired(storedToken)) {
            // 만료된 토큰 제거
            localStorage.removeItem(TOKEN_KEY);
            setAuthState({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
            });
            return;
          }

          // 토큰 디코딩
          const decoded = decodeToken(storedToken);
          if (decoded) {
            const user: User = {
              id: decoded.sub || decoded.id || "",
              email: decoded.email,
              name: decoded.name || decoded.nickname || decoded.email || "사용자",
              provider: decoded.provider,
              profileImage: decoded.profileImage,
            };

            setAuthState({
              isAuthenticated: true,
              user,
              token: storedToken,
              isLoading: false,
            });
            return;
          }
        }

        // 토큰이 없거나 디코딩 실패
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          token: null,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, [mounted]);

  const login = useCallback((token: string) => {
    try {
      const decoded = decodeToken(token);
      if (!decoded) {
        throw new Error("Invalid token");
      }

      // 디버깅: 토큰 내용 확인
      console.log("=== 토큰 디코딩 결과 ===");
      console.log("Provider:", decoded.provider);
      console.log("Email:", decoded.email);
      console.log("Name:", decoded.name);
      console.log("Nickname:", decoded.nickname);
      console.log("Profile Image:", decoded.profileImage);
      console.log("전체 토큰 내용:", decoded);
      console.log("====================");

      const user: User = {
        id: decoded.sub || decoded.id || "",
        email: decoded.email,
        name: decoded.name || decoded.nickname || decoded.email || "사용자",
        provider: decoded.provider,
        profileImage: decoded.profileImage,
      };

      localStorage.setItem(TOKEN_KEY, token);
      setAuthState({
        isAuthenticated: true,
        user,
        token,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to login:", error);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  }, []);

  // 401 응답 공통 처리: 로그아웃 + 안내 + 복귀 경로 저장
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          POST_LOGIN_REDIRECT_KEY,
          window.location.pathname + window.location.search
        );
      }
      toast.error("로그인이 만료되었습니다. 다시 로그인해 주세요.");
    });
  }, [logout]);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
