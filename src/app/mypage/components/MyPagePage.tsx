"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { useAuth } from "@/contexts";
import { cn } from "@/lib/utils";
import { POST_LOGIN_REDIRECT_KEY } from "@/lib/auth-token";
import { useBookmarkListQuery } from "@/components/bookmark/hooks/service";

import { ExamHistorySection } from "./ExamHistorySection";
import { BookmarkListSection } from "./BookmarkListSection";
import { useExamHistoryQuery } from "../hooks/service";

type TTab = "history" | "bookmarks";

const TABS: { value: TTab; label: string }[] = [
  { value: "history", label: "내가 풀었던 문제" },
  { value: "bookmarks", label: "북마크" },
];

export const MyPagePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { data: bookmarks } = useBookmarkListQuery();
  const { data: examHistory } = useExamHistoryQuery(1, 1);

  const latestExam = examHistory?.items[0];
  const correctRate =
    latestExam && latestExam.totalQuestions > 0
      ? Math.round((latestExam.correctCount / latestExam.totalQuestions) * 100)
      : null;

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

        <div className="flex flex-col gap-6 md:flex-row">
          {/* 사이드바 */}
          <aside className="flex shrink-0 flex-col md:w-[260px]">
            <div className="flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm md:p-6">
              {/* 유저 아이콘 + 유저 정보: 항상 가로 배치 */}
              <div className="flex flex-row items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#5B93FF] to-[#0B45D1] text-lg font-semibold text-white shadow-[0_6px_16px_rgba(21,93,252,0.35)] ring-4 ring-white md:size-16 md:text-xl">
                  {user?.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.name ?? "프로필"}
                      width={64}
                      height={64}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span>{user?.name?.charAt(0) ?? "?"}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#101828] md:text-base">
                    {user?.name ?? "사용자"}
                  </p>
                  {user?.email && (
                    <p className="truncate text-xs text-[#9CA3AF]">{user.email}</p>
                  )}
                  {/* 모바일: 한 줄 요약 */}
                  <p className="mt-1 truncate text-xs text-[#6B7280] md:hidden">
                    북마크 {bookmarks?.length ?? 0}개
                    {correctRate !== null && <> · 최근 정답률 {correctRate}%</>}
                  </p>
                </div>
              </div>

              {/* 데스크탑: 통계 타일 */}
              <div className="hidden grid-cols-2 gap-2 md:grid">
                <div className="rounded-lg bg-[#F3F4F6] px-3 py-2.5 text-center">
                  <p className="text-lg font-bold text-[#101828]">
                    {bookmarks?.length ?? 0}
                  </p>
                  <p className="text-xs text-[#6B7280]">북마크</p>
                </div>
                <div className="rounded-lg bg-[#F3F4F6] px-3 py-2.5 text-center">
                  <p className="text-lg font-bold text-[#101828]">
                    {correctRate !== null ? `${correctRate}%` : "-"}
                  </p>
                  <p className="text-xs text-[#6B7280]">최근 정답률</p>
                </div>
              </div>
            </div>
          </aside>

          {/* 메인 콘텐츠 */}
          <div className="min-w-0 flex-1">
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

            {activeTab === "history" ? (
              <ExamHistorySection />
            ) : (
              <BookmarkListSection />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
