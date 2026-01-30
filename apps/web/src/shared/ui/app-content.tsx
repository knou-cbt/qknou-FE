"use client";

import { usePathname } from "next/navigation";

import { Header } from "./header";
import { Footer } from "./footer";
import { useExamContext } from "@/modules/exam";

interface AppContentProps {
  children: React.ReactNode;
}

export function AppContent({ children }: AppContentProps) {
  const pathname = usePathname();
  const { isSubmitted } = useExamContext();

  // 시험모드 경로 체크 (제출 후에는 exam 모드 해제)
  const isExamMode = pathname.includes("/test-mode") && !isSubmitted;

  return (
    <div className="flex min-h-screen flex-col overflow-y-auto bg-white">
      <Header
        key={isExamMode ? "exam" : "default"}
        variant={isExamMode ? "exam" : "default"}
      />
      {children}
      <Footer />
    </div>
  );
}
