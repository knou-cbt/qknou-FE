"use client";

import { useEffect, useState } from "react";

// 고정(fixed) 사이드 광고가 콘텐츠를 가리지 않으려면 태블릿보다 넓은 화면이 필요 — Tailwind `xl`과 동일
const DESKTOP_BREAKPOINT = 1280;

/** fixed 사이드 광고(160px) + right-4(16px) + 콘텐츠 간격(16px) */
export const DESKTOP_SIDE_AD_RESERVED_PX = 160 + 16 + 16;

export const examSideAdContentStyle = {
  "--desktop-side-ad-reserved": `${DESKTOP_SIDE_AD_RESERVED_PX}px`,
} as React.CSSProperties;

/**
 * 쿠팡 파트너스 활동으로 발급받은 딥링크. 배너/광고 클릭 시 이 중 하나로 랜덤 이동한다.
 * (페이지 배너는 COUPANG_BANNERS의 이미지+링크를 그대로 사용)
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

interface ICoupangBanner {
  href: string;
  imgSrc: string;
  width: number;
  height: number;
}

/**
 * 쿠팡 파트너스에서 발급받은 배너(이미지 + 딥링크)를 슬롯별로 채워 넣는다.
 * null인 슬롯은 렌더링하지 않는다 (배너 등록 전 레이아웃 깨짐 방지).
 */
export const COUPANG_BANNERS: Record<
  "mobile" | "mobileRect" | "desktopBottom" | "desktopSide",
  ICoupangBanner | null
> = {
  mobile: null,
  mobileRect: null,
  desktopBottom: {
    href: "https://link.coupang.com/a/hcmYkPk9kG",
    imgSrc:
      "https://ads-partners.coupang.com/banners/1031443?trackingCode=AF2198707&subId=&traceId=V0-301-879dd1202e5c73b2-I1031443&w=728&h=90",
    width: 728,
    height: 90,
  },
  desktopSide: null,
};

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

function CoupangBanner({ banner }: { banner: ICoupangBanner | null }) {
  if (!banner) return null;

  return (
    <a
      href={banner.href}
      target="_blank"
      rel="noopener sponsored"
      referrerPolicy="unsafe-url"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 쿠팡 파트너스가 직접 제공하는 트래킹 이미지 URL */}
      <img
        src={banner.imgSrc}
        alt=""
        width={banner.width}
        height={banner.height}
      />
    </a>
  );
}

/**
 * - 모바일: 320x50 하단 + 320x480 사각 배너
 * - 웹: 728x90 하단 + 160x600 사이드 (전 페이지)
 * - 콘텐츠 max-w 반응형은 시험/암기모드 상세에서 examDetailMaxW로 처리
 * - 각 슬롯은 쿠팡 파트너스에서 발급받은 배너(COUPANG_BANNERS)로 채워진다
 */
export function CoupangAd() {
  // 서버 렌더링 시점엔 window가 없어 화면 폭을 알 수 없다. null로 시작해
  // 마운트 전까지는 아무것도 그리지 않아야 SSR과 클라이언트 첫 렌더가
  // 일치해서 하이드레이션 불일치(Hydration failed)가 나지 않는다.
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const set = () => setIsDesktop(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const hasAnyBanner = Object.values(COUPANG_BANNERS).some(Boolean);
  if (!hasAnyBanner || isDesktop === null) return null;

  return (
    <div className="flex w-full flex-col items-center gap-1">
      {/* 모바일: 320x50 + 320x480 */}
      {!isDesktop && (
        <>
          <div className="flex w-full justify-center py-2">
            <div className="relative min-h-[50px] w-full max-w-[320px]">
              <CoupangBanner banner={COUPANG_BANNERS.mobile} />
            </div>
          </div>
          <div className="flex w-full justify-center py-2">
            <div className="relative min-h-[480px] w-full max-w-[320px]">
              <CoupangBanner banner={COUPANG_BANNERS.mobileRect} />
            </div>
          </div>
        </>
      )}

      {/* 웹 하단 + 사이드 */}
      {isDesktop && (
        <>
          <div className="flex w-full justify-center py-2">
            <div className="relative h-[90px] w-[728px]">
              <CoupangBanner banner={COUPANG_BANNERS.desktopBottom} />
            </div>
          </div>
          <div className="fixed right-4 top-24 z-40 h-[600px] w-[160px]">
            <CoupangBanner banner={COUPANG_BANNERS.desktopSide} />
          </div>
        </>
      )}

      <CoupangDisclosure />
    </div>
  );
}
