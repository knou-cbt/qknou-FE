"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { KakaoAdFit, KAKAO_ADFIT_UNITS } from "@/components/ads/KakaoAdFit";
import { cn } from "@/lib/utils";

// 고정(fixed) 사이드 광고가 콘텐츠를 가리지 않으려면 태블릿보다 넓은 화면이 필요 — Tailwind `xl`과 동일
const DESKTOP_BREAKPOINT = 1280;

/**
 * 사이드 광고는 제거됨. examDetailStyle/examDetailContentAreaClassName을 쓰는
 * 시험·암기모드 상세 페이지들이 있어 값 자체는 0으로 남겨 콘텐츠 폭이 그대로 100%가 되게 한다.
 */
export const DESKTOP_SIDE_AD_RESERVED_PX = 0;

export const examSideAdContentStyle = {
  "--desktop-side-ad-reserved": `${DESKTOP_SIDE_AD_RESERVED_PX}px`,
} as React.CSSProperties;

/**
 * - 모바일: 하단 가로형 배너(320x50)
 * - 웹: 하단 배너(728x90). 사이드 광고는 지저분하다는 피드백으로 제거함
 * - 전부 카카오 애드핏 (광고 갱신은 애드핏이 자체적으로 처리)
 * - 하단 광고는 화면에 고정된 채 접기/펼치기가 가능한 바 형태로 표시
 * - 바 높이는 화면 크기별 배너 크기에 따라 달라서 고정 px 대신 ResizeObserver로 실측해 spacer/collapse에 사용
 * - 콘텐츠 max-w 반응형은 시험/암기모드 상세에서 examDetailMaxW로 처리
 */
export function KakaoAd() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [barHeight, setBarHeight] = useState(0);
  const barContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    const el = barContentRef.current;
    if (!el) return;
    // ResizeObserver의 entry.contentRect는 content-box라 el의 상하 padding(py-2,
    // 16px)이 빠진다. spacer/collapse translateY 둘 다 실제 렌더링 높이(border-box)와
    // 맞아야 해서 offsetHeight를 직접 읽는다 — 안 그러면 접었을 때 바가 16px만큼
    // 화면에 남고, 펼쳤을 때도 spacer가 16px 부족해서 푸터와 어긋난다.
    const observer = new ResizeObserver(() => setBarHeight(el.offsetHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [isDesktop]);

  if (isDesktop === null) {
    return null;
  }

  const banner = isDesktop
    ? KAKAO_ADFIT_UNITS.desktopBanner
    : KAKAO_ADFIT_UNITS.mobileBanner;

  // 광고 단위 코드가 아직 없으면 빈 바만 떠 있게 되므로 아예 렌더하지 않는다
  if (!banner.unit) {
    return null;
  }

  return (
    <>
      {/* 하단 고정 광고 바가 콘텐츠(푸터)를 가리지 않도록 자리 예약 */}
      <div
        aria-hidden
        style={{ height: isExpanded ? barHeight : 0 }}
        className="w-full shrink-0 transition-[height] duration-300"
      />

      {/* 하단 고정 + 접기/펼치기 가능한 카카오 애드핏 광고 바 */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center"
        style={{
          transform: isExpanded ? "translateY(0)" : `translateY(${barHeight}px)`,
          transition: "transform 300ms ease",
        }}
      >
        <div className="relative w-full max-w-[1100px]">
          {/* 접기/펼치기 탭 */}
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            aria-label={isExpanded ? "광고 접기" : "광고 펼치기"}
            className="absolute -top-7 left-1/2 flex h-7 w-14 -translate-x-1/2 cursor-pointer items-center justify-center rounded-t-xl border border-b-0 border-gray-200 bg-white shadow-[0_-2px_6px_rgba(0,0,0,0.08)]"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 text-gray-500 transition-transform duration-300",
                !isExpanded && "rotate-180"
              )}
            />
          </button>

          <div
            ref={barContentRef}
            className="relative flex flex-col items-center bg-white px-4 py-2 shadow-[0_-4px_10px_rgba(0,0,0,0.08)]"
          >
            <KakaoAdFit key={banner.unit} {...banner} />
          </div>
        </div>
      </div>
    </>
  );
}
