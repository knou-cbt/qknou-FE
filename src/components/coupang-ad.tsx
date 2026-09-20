"use client";

import { useState } from "react";

// 고정(fixed) 사이드 광고가 콘텐츠를 가리지 않으려면 태블릿보다 넓은 화면이 필요 — Tailwind `xl`과 동일
const DESKTOP_BREAKPOINT = 1280;

/** fixed 사이드 광고(160px) + right-4(16px) + 콘텐츠 간격(16px) */
export const DESKTOP_SIDE_AD_RESERVED_PX = 160 + 16 + 16;

export const examSideAdContentStyle = {
  "--desktop-side-ad-reserved": `${DESKTOP_SIDE_AD_RESERVED_PX}px`,
} as React.CSSProperties;

/**
 * 쿠팡 파트너스 활동으로 발급받은 딥링크. 배너/광고 클릭 시 이 중 하나로 랜덤 이동한다.
 * (쿠팡 파트너스 위젯을 쓰는 자리는 COUPANG_WIDGET_SRC의 iframe src로 대체 예정)
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

/**
 * 쿠팡 파트너스 사이트에서 발급받은 배너 위젯의 iframe src를 슬롯별로 채워 넣는다.
 * 빈 문자열인 슬롯은 렌더링하지 않는다 (위젯 코드 등록 전 레이아웃 깨짐 방지).
 */
export const COUPANG_WIDGET_SRC = {
  mobile: "",
  mobileRect: "",
  desktopBottom: "",
  desktopSide: "",
} as const;

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

function CoupangWidget({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) {
  if (!src) return null;

  return (
    <iframe
      src={src}
      width={width}
      height={height}
      frameBorder="0"
      scrolling="no"
      referrerPolicy="unsafe-url"
      title="쿠팡 파트너스 광고"
    />
  );
}

/**
 * - 모바일: 320x50 하단 + 320x480 사각 배너
 * - 웹: 728x90 하단 + 160x600 사이드 (전 페이지)
 * - 콘텐츠 max-w 반응형은 시험/암기모드 상세에서 examDetailMaxW로 처리
 * - 각 슬롯은 쿠팡 파트너스 위젯 iframe(COUPANG_WIDGET_SRC)으로 채워진다
 */
export function CoupangAd() {
  const [isDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`).matches
  );

  const hasAnyWidget = Object.values(COUPANG_WIDGET_SRC).some(Boolean);
  if (!hasAnyWidget) return null;

  return (
    <div className="flex w-full flex-col items-center gap-1">
      {/* 모바일: 320x50 + 320x480 */}
      {!isDesktop && (
        <>
          <div className="flex w-full justify-center py-2">
            <div className="relative min-h-[50px] w-full max-w-[320px]">
              <CoupangWidget
                src={COUPANG_WIDGET_SRC.mobile}
                width={320}
                height={50}
              />
            </div>
          </div>
          <div className="flex w-full justify-center py-2">
            <div className="relative min-h-[480px] w-full max-w-[320px]">
              <CoupangWidget
                src={COUPANG_WIDGET_SRC.mobileRect}
                width={320}
                height={480}
              />
            </div>
          </div>
        </>
      )}

      {/* 웹 하단 + 사이드 */}
      {isDesktop && (
        <>
          <div className="flex w-full justify-center py-2">
            <div className="relative h-[90px] w-[728px]">
              <CoupangWidget
                src={COUPANG_WIDGET_SRC.desktopBottom}
                width={728}
                height={90}
              />
            </div>
          </div>
          <div className="fixed right-4 top-24 z-40 h-[600px] w-[160px]">
            <CoupangWidget
              src={COUPANG_WIDGET_SRC.desktopSide}
              width={160}
              height={600}
            />
          </div>
        </>
      )}

      <CoupangDisclosure />
    </div>
  );
}
