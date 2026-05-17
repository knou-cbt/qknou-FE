"use client";
import { usePathname } from "next/navigation";

import { Header, Footer, KakaoAd } from "@/components";
import { useExamContext } from "@/contexts";

interface AppContentProps {
  children: React.ReactNode;
}

export function AppContent({ children }: AppContentProps) {
  const pathname = usePathname();
  const { isSubmitted } = useExamContext();

  // 시험모드 경로 체크 (제출 후에는 exam 모드 해제)
  const isExamMode = pathname.includes("/test-mode") && !isSubmitted;

  // auth/success 페이지에서는 헤더 숨김
  const shouldHideHeader = pathname === "/auth/success";

  return (
    <div className="flex min-h-screen flex-col overflow-y-auto bg-white">
      {!shouldHideHeader && (
        <Header
          key={isExamMode ? "exam" : "default"}
          variant={isExamMode ? "exam" : "default"}
        />
      )}
      {children}
      <KakaoAd />
      <Footer />
    </div>
  );
}
