import { cn } from "@/lib/utils";
import { examSideAdContentStyle } from "@/components/kakao-ad";

/** CSS 변수(--desktop-side-ad-reserved) 설정용 */
export const examDetailStyle = examSideAdContentStyle;

/**
 * 시험/암기모드 상세: 광고 영역만큼 콘텐츠 래퍼 너비 축소
 * (자식 max-w만 줄이면 items-center 기준으로 광고와 겹침)
 */
export const examDetailContentAreaClassName =
  "w-full md:w-[calc(100%-var(--desktop-side-ad-reserved))]";

const contentMaxW = (px: number) =>
  cn("w-full mx-auto", `max-w-[${px}px]`);

/** 래퍼 안에서 쓰는 고정 max-w */
export const examDetailMaxW = {
  1104: contentMaxW(1104),
  1100: contentMaxW(1100),
  1066: contentMaxW(1066),
  896: contentMaxW(896),
} as const;

export type ExamDetailMaxW = keyof typeof examDetailMaxW;

export function examDetailContainer(max: ExamDetailMaxW, ...extra: string[]) {
  return cn(examDetailMaxW[max], ...extra);
}
