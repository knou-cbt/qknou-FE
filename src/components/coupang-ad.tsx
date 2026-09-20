/**
 * 해설 30분 무제한 잠금 해제(AdUnlockModal) 전용 쿠팡 파트너스 자료.
 * 사이트 배너 광고는 kakao-ad.tsx(KakaoAd)를 그대로 유지한다.
 */

/**
 * 쿠팡 파트너스 활동으로 발급받은 딥링크. 잠금 해제 배너 클릭 시 이 중 하나로 랜덤 이동한다.
 * (배너 이미지 코드가 없어 텍스트 배너로 대체 중 — AdUnlockModal 참고)
 */
export const COUPANG_PARTNER_LINKS = [
  "https://link.coupang.com/a/hcmIpWXoJ2",
  "https://link.coupang.com/a/hcmK4aOhaL",
  "https://link.coupang.com/a/hcmMIqO1e0",
] as const;

export function pickRandomCoupangLink(): string {
  const index = Math.floor(Math.random() * COUPANG_PARTNER_LINKS.length);
  return COUPANG_PARTNER_LINKS[index];
}

/** 쿠팡 파트너스 활동 관련 공정거래위원회 고시 의무 표기 문구 */
export const COUPANG_DISCLOSURE_TEXT =
  "이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.";

export function CoupangDisclosure({ className }: { className?: string }) {
  return (
    <p className={`text-center text-xs text-[#9CA3AF] ${className ?? ""}`}>
      {COUPANG_DISCLOSURE_TEXT}
    </p>
  );
}
