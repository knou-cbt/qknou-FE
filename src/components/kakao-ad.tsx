"use client";

import { useEffect, useState } from "react";

import { CoupangDisclosure } from "@/components/coupang-ad";

// 고정(fixed) 사이드 광고가 콘텐츠를 가리지 않으려면 태블릿보다 넓은 화면이 필요 — Tailwind `xl`과 동일
const DESKTOP_BREAKPOINT = 1280;
const ADFIT_SCRIPT_SRC = "https://t1.daumcdn.net/kas/static/ba.min.js";

/** fixed 사이드 광고(160px) + right-4(16px) + 콘텐츠 간격(16px) */
export const DESKTOP_SIDE_AD_RESERVED_PX = 160 + 16 + 16;

export const examSideAdContentStyle = {
  "--desktop-side-ad-reserved": `${DESKTOP_SIDE_AD_RESERVED_PX}px`,
} as React.CSSProperties;

export const AD_UNIT = {
  mobile: "DAN-ctqbpCkL5AnrfFZY",
  mobileRect: "DAN-xvCJKicUSkdeRspa",
} as const;

/** 웹(데스크탑) 하단/사이드는 쿠팡 파트너스로 전환 */
const COUPANG_DESKTOP_SIDE_WIDGET_SRC = "https://coupa.ng/cpDlpC";
const COUPANG_DESKTOP_BOTTOM_LINK = "https://link.coupang.com/a/hcpv2rzXPg";

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

export function loadAdfitScript() {
  removeAdfitScripts();
  clearAdSlots();

  const script = document.createElement("script");
  script.src = ADFIT_SCRIPT_SRC;
  script.async = true;
  document.body.appendChild(script);
}

/**
 * - 모바일: 320x50 하단 + 320x480 사각 배너 (카카오 애드핏)
 * - 웹: 하단 + 사이드 (쿠팡 파트너스)
 * - 콘텐츠 max-w 반응형은 시험/암기모드 상세에서 examDetailMaxW로 처리
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

      {/* 웹 하단 + 사이드: 쿠팡 파트너스 */}
      {isDesktop && (
        <>
          <div className="flex w-full flex-col items-center gap-2 py-2">
            <a
              href={COUPANG_DESKTOP_BOTTOM_LINK}
              target="_blank"
              rel="noopener sponsored"
              referrerPolicy="unsafe-url"
              className="flex h-[90px] w-[728px] flex-col items-center justify-center gap-1 rounded-[12px] bg-gradient-to-br from-[#F0F4FF] to-[#DCE6FF] text-center transition-opacity hover:opacity-90"
            >
              <span className="text-sm font-semibold text-[#155DFC]">
                쿠팡 파트너스
              </span>
              <span className="text-base font-bold text-[#1F2937]">
                지금 쿠팡에서 특가 상품 보러가기
              </span>
            </a>
            <CoupangDisclosure />
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
