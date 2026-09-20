import { cn } from "@/lib/utils";

/** 쿠팡 파트너스 활동 관련 공정거래위원회 고시 의무 표기 문구 */
export const COUPANG_DISCLOSURE_TEXT =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

export function CoupangDisclosure({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-xs text-[#9CA3AF]", className)}>
      {COUPANG_DISCLOSURE_TEXT}
    </p>
  );
}
