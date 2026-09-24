import type { Metadata } from "next";
import { Suspense } from "react";

import { MyPagePage } from "./components/MyPagePage";

export const metadata: Metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

// 로그인 상태/쿼리스트링(tab)에 의존하는 페이지라 정적 프리렌더링 대상에서 제외
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
          <p className="text-[#6B7280]">불러오는 중...</p>
        </div>
      }
    >
      <MyPagePage />
    </Suspense>
  );
}
