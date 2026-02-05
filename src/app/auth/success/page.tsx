"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const SuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        const token = searchParams.get("token");
        console.log("Token from URL:", token ? "존재함" : "없음");

      if (token) {
          // 토큰 저장 및 로그인 처리
          console.log("로그인 처리 중...");
          login(token);
          console.log("로그인 완료, 리다이렉트 예정...");

          // 짧은 지연 후 홈으로 이동 (사용자에게 피드백 제공)
          setTimeout(() => {
            console.log("홈으로 리다이렉트 시작");
            // router.push와 window.location 둘 다 시도
            router.push("/");
            
            // 만약 router.push가 작동하지 않으면 window.location 사용
            setTimeout(() => {
              console.log("window.location으로 리다이렉트");
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#155DFC] rounded-full mb-4 animate-pulse">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
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
