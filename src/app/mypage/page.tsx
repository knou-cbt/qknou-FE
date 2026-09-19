import type { Metadata } from "next";
import { Suspense } from "react";

import { MyPagePage } from "./components/MyPagePage";

export const metadata: Metadata = {
  title: "마이페이지",
  robots: { index: false, follow: false },
};

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
