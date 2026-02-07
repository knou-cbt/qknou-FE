"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const SuccessContent = () => {
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

          // 짧은 지연 후 홈으로 이동 (사용자에게 피드백 제공)
          setTimeout(() => {
            // router.push와 window.location 둘 다 시도
            router.push("/");
            
            // 만약 router.push가 작동하지 않으면 window.location 사용
            setTimeout(() => {
              window.location.href = "/";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F9FAFB] to-[#EFF6FF]">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <DotLottieReact
            src="https://lottie.host/42c54b62-8c5c-420a-b6ee-c1ccbb807a8c/R81ZrMWu9A.lottie"
            loop
            autoplay
            className="w-32 h-32"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          로그인 성공!
        </h1>
        <p className="text-gray-600">잠시만 기다려주세요...</p>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">로딩 중...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
};

export default SuccessPage;
