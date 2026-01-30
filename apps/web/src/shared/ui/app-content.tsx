"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { Header } from "./header";
import { Footer } from "./footer";
import { useExamContext } from "@/modules/exam";

import chatbotImg from "../../../../../public/chatbot.png";

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
      {/* 챗봇 플로팅 버튼 */}
      <button
        type="button"
        onClick={() => alert("챗봇 서비스 개발중입니다.")}
        className="fixed bottom-6 right-6 z-50 pl-2 size-14 rounded-full shadow-lg transition bg-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#5D50FF] focus:ring-offset-2 cursor-pointer"
        aria-label="챗봇"
      >
        <Image
          src={chatbotImg}
          alt="챗봇"
          className="size-full object-contain"
          width={56}
          height={56}
        />
      </button>
    </div>
  );
}
