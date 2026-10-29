"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { LoginSuccessIcon } from "./LoginSuccessIcon";

const POST_LOGIN_REDIRECT_KEY = "qknou_post_login_redirect";

/** 성공 화면을 보여준 뒤 복귀 경로로 이동하기까지의 지연 — 하단 진행 바도 이 시간에 맞춰 찬다 */
const REDIRECT_DELAY_MS = 1500;

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
          }, REDIRECT_DELAY_MS);
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
    <SuccessLayout>
      <LoginSuccessIcon className="mx-auto mb-6 h-20 w-20 sm:h-24 sm:w-24" />
      <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
        로그인되었어요
      </h1>
      <p className="text-sm text-gray-600 sm:text-base">
        잠시 후 자동으로 이동해요
      </p>

      <div
        role="progressbar"
        aria-label="이동 준비 중"
        className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-[#E5EDFF]"
      >
        <div
          className="h-full origin-left rounded-full bg-[#155DFC]"
          style={{
            animation: `login-success-progress ${REDIRECT_DELAY_MS}ms linear forwards`,
          }}
        />
      </div>
    </SuccessLayout>
  );
};

/** 로그인 페이지와 같은 배경·로고·카드 구성 */
const SuccessLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen items-start justify-center bg-gradient-to-b from-[#F9FAFB] to-[#EFF6FF] px-4 pt-16 sm:pt-20">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center sm:mb-8">
          <Image
            src="/logo.svg"
            alt="QKNOU LOGO"
            width={96}
            height={96}
            className="h-20 w-20 sm:h-24 sm:w-24"
          />
        </div>
        <div className="rounded-2xl bg-white px-6 py-10 text-center shadow-lg sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export const SuccessContent = () => {
  return (
    <Suspense
      fallback={
        <SuccessLayout>
          <p className="text-sm text-gray-600">로그인 처리 중...</p>
        </SuccessLayout>
      }
    >
      <SuccessInner />
    </Suspense>
  );
};
