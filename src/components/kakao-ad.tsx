"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const DESKTOP_BREAKPOINT = 768;

const AD_UNIT = {
  mobile: "DAN-ctqbpCkL5AnrfFZY",
  desktopBottom: "DAN-rjm8cuVO5tqxkcLZ",
  desktopSide: "DAN-FXMS0a38OFAgXFvs",
} as const;

/**
 * - 모바일: 320x50 하단
 * - 웹: 728x90 하단 + 160x600 사이드 (스크립트 1회 로드)
 * - 뷰포트에 보이는 슬롯만 DOM에 넣어 "Cannot visible ad on screen" 방지
 */
export function KakaoAd() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  if (isDesktop === null) {
    return null;
  }

  const scriptKey = isDesktop ? "desktop" : "mobile";

  return (
    <>
      {/* 모바일: 320x50 */}
      {!isDesktop && (
        <div className="flex w-full justify-center py-2">
          <div className="relative min-h-[50px] w-full max-w-[320px]">
            <ins
              className="kakao_ad_area absolute inset-0 min-h-[50px] min-w-[320px]"
              style={{ width: "100%", maxWidth: 320 }}
              data-ad-unit={AD_UNIT.mobile}
              data-ad-width="320"
              data-ad-height="50"
            />
          </div>
        </div>
      )}

      {/* 웹 하단 + 사이드 */}
      {isDesktop && (
        <>
          <div className="flex w-full justify-center py-2">
            <div className="relative h-[90px] w-[728px]">
              <ins
                className="kakao_ad_area absolute inset-0 h-[90px] w-[728px]"
                data-ad-unit={AD_UNIT.desktopBottom}
                data-ad-width="728"
                data-ad-height="90"
              />
            </div>
          </div>
          <div className="fixed right-4 top-24 z-40 h-[600px] w-[160px]">
            <div className="relative h-full w-full">
              <ins
                className="kakao_ad_area absolute inset-0 h-[600px] w-[160px]"
                data-ad-unit={AD_UNIT.desktopSide}
                data-ad-width="160"
                data-ad-height="600"
              />
            </div>
          </div>
        </>
      )}

      <Script
        key={scriptKey}
        src="https://t1.daumcdn.net/kas/static/ba.min.js"
        strategy="lazyOnload"
      />
    </>
  );
}
