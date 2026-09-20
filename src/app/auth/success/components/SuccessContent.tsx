"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const POST_LOGIN_REDIRECT_KEY = "qknou_post_login_redirect";

function getSafeRedirectPath(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }
  return path;
}

const SuccessInner = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        const token = searchParams.get("token");
        console.debug("Token from URL:", token ? "존재함" : "없음");

        if (token) {
          // 토큰 저장 및 로그인 처리
          login(token);
          const redirectFromQuery = searchParams.get("redirect");
          const redirectFromStorage =
            typeof window !== "undefined"
              ? sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)
              : null;
          const redirectPath = getSafeRedirectPath(
            redirectFromQuery ?? redirectFromStorage
          );
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
          }

          // 짧은 지연 후 복귀 경로로 이동 (사용자에게 피드백 제공)
          setTimeout(() => {
            // router.push와 window.location 둘 다 시도
            router.push(redirectPath);

            // 만약 router.push가 작동하지 않으면 window.location 사용
            setTimeout(() => {
              window.location.href = redirectPath;
            }, 500);
          }, 1500);
        } else {
          // 토큰이 없으면 로그인 페이지로 이동
          console.error("No token found in URL");
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Login process error:", error);
        router.push("/auth/login");
      }
    };

    handleLogin();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle2 className="w-24 h-24 text-[#22C55E]" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          로그인 성공!
        </h1>
        <p className="text-gray-600">잠시만 기다려주세요...</p>
      </div>
    </div>
  );
};

export const SuccessContent = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">로딩 중...</div>
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
};
