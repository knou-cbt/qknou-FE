"use client";

import { useEffect, useState } from "react";

const DESKTOP_BREAKPOINT = 768;
const ADFIT_SCRIPT_SRC = "https://t1.daumcdn.net/kas/static/ba.min.js";

/** fixed 사이드 광고(160px) + right-4(16px) + 콘텐츠 간격(16px) */
export const DESKTOP_SIDE_AD_RESERVED_PX = 160 + 16 + 16;

const AD_UNIT = {
  mobile: "DAN-ctqbpCkL5AnrfFZY",
  mobileRect: "DAN-xvCJKicUSkdeRspa",
  desktopBottom: "DAN-rjm8cuVO5tqxkcLZ",
  desktopSide: "DAN-FXMS0a38OFAgXFvs",
} as const;

function removeAdfitScripts() {
  document
    .querySelectorAll(`script[src="${ADFIT_SCRIPT_SRC}"]`)
    .forEach((node) => node.remove());
}

function clearAdSlots() {
  document.querySelectorAll("ins.kakao_ad_area").forEach((el) => {
    el.innerHTML = "";
  });
}

function loadAdfitScript() {
  removeAdfitScripts();
  clearAdSlots();

  const script = document.createElement("script");
  script.src = ADFIT_SCRIPT_SRC;
  script.async = true;
  document.body.appendChild(script);
}

/**
 * - 모바일: 320x50 하단
 * - 웹: 728x90 하단 + 160x600 사이드 (AppContent에서 우측 여백 확보)
 * - 뷰포트에 보이는 슬롯만 DOM에 넣어 "Cannot visible ad on screen" 방지
 * - ba.min.js는 최초 1회만 스캔하므로 breakpoint 변경 시 스크립트 재주입
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

  useEffect(() => {
    if (isDesktop === null) return;

    const timer = window.setTimeout(loadAdfitScript, 0);
    return () => {
      window.clearTimeout(timer);
      removeAdfitScripts();
    };
  }, [isDesktop]);

  if (isDesktop === null) {
    return null;
  }

  return (
    <>
      {/* 모바일: 320x50 + 320x480 */}
      {!isDesktop && (
        <>
          <div className="flex w-full justify-center py-2">
            <div className="relative min-h-[50px] w-full max-w-[320px]">
              <ins
                className="kakao_ad_area absolute inset-0 min-h-[50px] min-w-[320px]"
                style={{ display: "none" }}
                data-ad-unit={AD_UNIT.mobile}
                data-ad-width="320"
                data-ad-height="50"
              />
            </div>
          </div>
          <div className="flex w-full justify-center py-2">
            <div className="relative min-h-[480px] w-full max-w-[320px]">
              <ins
                className="kakao_ad_area absolute inset-0 min-h-[480px] min-w-[320px]"
                style={{ display: "none" }}
                data-ad-unit={AD_UNIT.mobileRect}
                data-ad-width="320"
                data-ad-height="480"
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
    </>
  );
}
