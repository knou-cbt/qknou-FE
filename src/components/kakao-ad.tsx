"use client";

import { useEffect, useState } from "react";

import { CoupangDisclosure } from "@/components/coupang-ad";

// 고정(fixed) 사이드 광고가 콘텐츠를 가리지 않으려면 태블릿보다 넓은 화면이 필요 — Tailwind `xl`과 동일
const DESKTOP_BREAKPOINT = 1280;

/** fixed 사이드 광고(160px) + right-4(16px) + 콘텐츠 간격(16px) */
export const DESKTOP_SIDE_AD_RESERVED_PX = 160 + 16 + 16;

export const examSideAdContentStyle = {
  "--desktop-side-ad-reserved": `${DESKTOP_SIDE_AD_RESERVED_PX}px`,
} as React.CSSProperties;

/** 모바일 하단 + 사각 배너 (쿠팡 파트너스, 사이즈는 120x240 고정) */
const COUPANG_MOBILE_BOTTOM_WIDGET_SRC = "https://coupa.ng/cpDnB9";
const COUPANG_MOBILE_RECT_WIDGET_SRC = "https://coupa.ng/cpDnDp";

/** 웹(데스크탑) 하단/사이드는 쿠팡 파트너스로 전환 */
const COUPANG_DESKTOP_SIDE_WIDGET_SRC = "https://coupa.ng/cpDlpC";

/** 하단 배너는 이 중 하나를 시간 간격으로 랜덤하게 보여준다 */
const COUPANG_DESKTOP_BOTTOM_WIDGET_SRCS = [
  "https://ads-partners.coupang.com/widgets.html?id=1031448&template=banner&trackingCode=AF2198707&subId=&width=728&height=90",
  "https://ads-partners.coupang.com/widgets.html?id=1031450&template=banner&trackingCode=AF2198707&subId=&width=728&height=90",
  "https://ads-partners.coupang.com/widgets.html?id=1031451&template=banner&trackingCode=AF2198707&subId=&width=728&height=90",
  "https://ads-partners.coupang.com/widgets.html?id=1031452&template=banner&trackingCode=AF2198707&subId=&width=728&height=90",
] as const;

const BOTTOM_WIDGET_ROTATE_INTERVAL_MS = 60 * 60 * 1000;

function pickRandomBottomWidgetSrc(): string {
  const index = Math.floor(
    Math.random() * COUPANG_DESKTOP_BOTTOM_WIDGET_SRCS.length
  );
  return COUPANG_DESKTOP_BOTTOM_WIDGET_SRCS[index];
}

/**
 * - 모바일: 하단 + 사각 위젯(120x240 x2)
 * - 웹: 하단(로테이션) + 사이드
 * - 전부 쿠팡 파트너스 위젯 iframe
 * - 콘텐츠 max-w 반응형은 시험/암기모드 상세에서 examDetailMaxW로 처리
 */
export function KakaoAd() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [desktopBottomWidgetSrc, setDesktopBottomWidgetSrc] = useState(() =>
    pickRandomBottomWidgetSrc()
  );

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDesktopBottomWidgetSrc(pickRandomBottomWidgetSrc());
    }, BOTTOM_WIDGET_ROTATE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  if (isDesktop === null) {
    return null;
  }

  return (
    <>
      {/* 모바일: 쿠팡 파트너스 */}
      {!isDesktop && (
        <div className="flex w-full flex-col items-center gap-2 py-2">
          <div className="flex justify-center gap-2">
            <iframe
              src={COUPANG_MOBILE_BOTTOM_WIDGET_SRC}
              width={120}
              height={240}
              frameBorder="0"
              scrolling="no"
              referrerPolicy="unsafe-url"
              title="쿠팡 파트너스 광고"
            />
            <iframe
              src={COUPANG_MOBILE_RECT_WIDGET_SRC}
              width={120}
              height={240}
              frameBorder="0"
              scrolling="no"
              referrerPolicy="unsafe-url"
              title="쿠팡 파트너스 광고"
            />
          </div>
          <CoupangDisclosure />
        </div>
      )}

      {/* 웹 하단 + 사이드: 쿠팡 파트너스 */}
      {isDesktop && (
        <>
          <div className="flex w-full flex-col items-start gap-2 py-2 max-w-[1100px] mx-auto">
            <iframe
              key={desktopBottomWidgetSrc}
              src={desktopBottomWidgetSrc}
              width={728}
              height={90}
              frameBorder="0"
              scrolling="no"
              referrerPolicy="unsafe-url"
              title="쿠팡 파트너스 광고"
            />
            <CoupangDisclosure className="text-start" />
          </div>
          <div className="fixed right-4 top-24 z-40 flex w-[160px] justify-center rounded-[12px] bg-white">
            <iframe
              src={COUPANG_DESKTOP_SIDE_WIDGET_SRC}
              width={160}
              height={480}
              frameBorder="0"
              scrolling="no"
              referrerPolicy="unsafe-url"
              title="쿠팡 파트너스 광고"
            />
          </div>
        </>
      )}
    </>
  );
}
