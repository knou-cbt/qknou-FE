"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/contexts";
import { cn } from "@/lib/utils";
import { POST_LOGIN_REDIRECT_KEY } from "@/lib/auth-token";

import { ExamHistorySection } from "./ExamHistorySection";
import { BookmarkListSection } from "./BookmarkListSection";

type TTab = "history" | "bookmarks";

const TABS: { value: TTab; label: string }[] = [
  { value: "history", label: "내가 풀었던 문제" },
  { value: "bookmarks", label: "북마크" },
];

export const MyPagePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  const activeTab: TTab =
    searchParams.get("tab") === "bookmarks" ? "bookmarks" : "history";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          POST_LOGIN_REDIRECT_KEY,
          window.location.pathname + window.location.search
        );
      }
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleTabChange = (tab: TTab) => {
    router.push(`/mypage?tab=${tab}`);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
        <p className="text-[#6B7280]">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#101828]">마이페이지</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            내 활동을 확인할 수 있어요.
          </p>
        </div>

        <div className="mb-4 flex gap-1 rounded-full bg-[#E5EAFF] p-1 md:gap-1 md:rounded-none md:border-b md:border-[#E5E7EB] md:bg-transparent md:p-0">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "flex-1 cursor-pointer rounded-full py-2 text-sm font-medium transition-colors md:flex-none md:rounded-none md:border-b-2 md:px-4 md:py-2.5",
                activeTab === tab.value
                  ? "bg-white text-[#155DFC] shadow-sm md:border-[#155DFC] md:bg-transparent md:shadow-none"
                  : "text-[#6B7280] hover:text-[#374153] md:border-transparent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "history" ? <ExamHistorySection /> : <BookmarkListSection />}
      </div>
    </div>
  );
};
