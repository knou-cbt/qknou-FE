"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useExplanationUnlock } from "@/lib/explanation-unlock";

const ADSENSE_CLIENT_ID = "ca-pub-7674232492620300";

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { pauseAdRequests?: 0 | 1 };
  }
}

const subscribeNothing = () => () => {};

/**
 * 구글 애드센스 스크립트. 애드센스는 게시자 콘텐츠가 없는 화면(로그인·로그인 완료·점검·404·
 * 로딩만 있는 마이페이지 등)에 광고를 금지하므로, 루트 레이아웃이 아니라 기출문제·과목 목록처럼
 * 서버에서 본문이 그려지는 페이지에서만 이 컴포넌트를 렌더한다.
 * React 19가 async 스크립트를 <head>로 올리고 src 기준으로 중복을 제거하므로 여러 번 렌더돼도 한 번만 로드된다.
 *
 * "30분 무제한 해설 받기"로 잠금 해제된 동안에는 광고를 띄우지 않는다. 잠금 상태는 localStorage에만
 * 있어서 서버에서는 알 수 없으므로, 스크립트는 SSR하지 않고 마운트 후 잠금 여부를 보고 붙인다.
 * 이미 로드된 페이지에서 잠금이 풀리면 추가 광고 요청을 멈추고, 이미 붙은 광고 슬롯을 걷어낸다.
 */
export function AdSenseScript() {
  const { isUnlocked } = useExplanationUnlock();
  const isMounted = useSyncExternalStore(subscribeNothing, () => true, () => false);

  useEffect(() => {
    const adsbygoogle = (window.adsbygoogle = window.adsbygoogle || []);
    adsbygoogle.pauseAdRequests = isUnlocked ? 1 : 0;
    if (isUnlocked) {
      document
        .querySelectorAll("ins.adsbygoogle, .google-auto-placed")
        .forEach((el) => el.remove());
    }
  }, [isUnlocked]);

  if (!isMounted || isUnlocked) return null;

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
