"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { CoupangDisclosure } from "@/components/coupang-ad";
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

/** 하단 배너는 이 위젯 id들 중 하나를 시간 간격으로 랜덤하게 보여준다 (화면 크기별로 width/height만 다르게 요청) */
const COUPANG_BOTTOM_WIDGET_IDS = ["1031448", "1031450", "1031451", "1031452"] as const;
const COUPANG_TRACKING_CODE = "AF2198707";

function buildCoupangBannerSrc(id: string, width: number, height: number): string {
  return `https://ads-partners.coupang.com/widgets.html?id=${id}&template=banner&trackingCode=${COUPANG_TRACKING_CODE}&subId=&width=${width}&height=${height}`;
}

/** 모바일 하단 배너: 세로로 긴 사각 위젯 대신 가로형 배너(IAB 모바일 배너 표준 320x50)로 축소 */
const MOBILE_BANNER_WIDTH = 320;
const MOBILE_BANNER_HEIGHT = 50;

/** 웹(데스크탑) 하단 배너 */
const DESKTOP_BANNER_WIDTH = 728;
const DESKTOP_BANNER_HEIGHT = 90;

const BOTTOM_WIDGET_ROTATE_INTERVAL_MS = 60 * 60 * 1000;

function pickRandomBottomWidgetId(): string {
  const index = Math.floor(Math.random() * COUPANG_BOTTOM_WIDGET_IDS.length);
  return COUPANG_BOTTOM_WIDGET_IDS[index];
}

/**
 * - 모바일: 하단 가로형 배너(320x50)
 * - 웹: 하단(로테이션). 사이드 광고는 지저분하다는 피드백으로 제거함
 * - 전부 쿠팡 파트너스 위젯 iframe
 * - 하단 광고는 화면에 고정된 채 접기/펼치기가 가능한 바 형태로 표시
 * - 공정위 고시 문구는 항상 배너 바로 아래 노출(숨겨두지 않음)
 * - 바 높이는 고지문구 줄바꿈 등으로 가변적이라 고정 px 대신 ResizeObserver로 실측해 spacer/collapse에 사용
 * - 콘텐츠 max-w 반응형은 시험/암기모드 상세에서 examDetailMaxW로 처리
 */
export function KakaoAd() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [bottomWidgetId, setBottomWidgetId] = useState(() =>
    pickRandomBottomWidgetId()
  );
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
    const interval = window.setInterval(() => {
      setBottomWidgetId(pickRandomBottomWidgetId());
    }, BOTTOM_WIDGET_ROTATE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = barContentRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setBarHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isDesktop]);

  if (isDesktop === null) {
    return null;
  }

  const bottomWidgetSrc = buildCoupangBannerSrc(
    bottomWidgetId,
    isDesktop ? DESKTOP_BANNER_WIDTH : MOBILE_BANNER_WIDTH,
    isDesktop ? DESKTOP_BANNER_HEIGHT : MOBILE_BANNER_HEIGHT
  );

  return (
    <>
      {/* 하단 고정 광고 바가 콘텐츠(푸터)를 가리지 않도록 자리 예약 */}
      <div
        aria-hidden
        style={{ height: isExpanded ? barHeight : 0 }}
        className="w-full shrink-0 transition-[height] duration-300"
      />

      {/* 하단 고정 + 접기/펼치기 가능한 쿠팡 파트너스 광고 바 */}
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
            className="relative flex flex-col items-center gap-1 bg-white px-4 py-2 shadow-[0_-4px_10px_rgba(0,0,0,0.08)]"
          >
            <iframe
              key={bottomWidgetSrc}
              src={bottomWidgetSrc}
              width={isDesktop ? DESKTOP_BANNER_WIDTH : MOBILE_BANNER_WIDTH}
              height={isDesktop ? DESKTOP_BANNER_HEIGHT : MOBILE_BANNER_HEIGHT}
              frameBorder="0"
              scrolling="no"
              referrerPolicy="unsafe-url"
              title="쿠팡 파트너스 광고"
            />

            <CoupangDisclosure />
          </div>
        </div>
      </div>
    </>
  );
}
