import type { Metadata } from "next";
import { Suspense } from "react";

import { BookmarkReviewPage } from "./components/BookmarkReviewPage";

export const metadata: Metadata = {
  title: "북마크 복습",
  robots: { index: false, follow: false },
};

// 로그인 상태 + useSearchParams(subject)에 의존하는 페이지라 정적 프리렌더링 대상에서 제외
// (/mypage, /auth/success와 동일한 이유 — 정적 HTML + 클라이언트 하이드레이션
// 타이밍 문제로 로딩에서 멈추는 문제 방지)
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F0F4FF]">
          <p className="text-[#6B7280]">불러오는 중...</p>
        </div>
      }
    >
      <BookmarkReviewPage />
    </Suspense>
  );
}
