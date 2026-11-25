"use client";

import { showLoginPrompt } from "@/lib/loginPrompt";
import { cn } from "@/lib/utils";

interface IPreviewLoginBannerProps {
  /** 비로그인에게 보여 준 문항 수 */
  previewCount: number;
  /** 시험 전체 문항 수 */
  totalQuestions: number;
  className?: string;
}

/**
 * 비로그인 미리보기 안내.
 * 문제 데이터 수집 대응으로 비로그인은 시험당 앞 몇 문항만 받고, 전체 문항과 정답·해설은 로그인해야 본다.
 */
export const PreviewLoginBanner = ({
  previewCount,
  totalQuestions,
  className,
}: IPreviewLoginBannerProps) => (
  <div
    className={cn(
      "flex flex-col gap-3 rounded-[16px] border border-[#C7D2FE] bg-[#EEF2FF] p-4 sm:flex-row sm:items-center sm:justify-between",
      className
    )}
  >
    <p className="text-sm text-[#3730A3]">
      로그인하지 않으면 앞 {previewCount}문항만 볼 수 있어요. 로그인하면 전체{" "}
      {totalQuestions}문항과 정답·해설을 볼 수 있어요.
    </p>
    <button
      type="button"
      onClick={showLoginPrompt}
      className="shrink-0 rounded-lg bg-[#155DFC] px-4 py-2 text-sm font-medium text-white hover:bg-[#1447E6]"
    >
      로그인하고 전체 보기
    </button>
  </div>
);
