"use client";

import { useEffect, useRef } from "react";

const KAKAO_ADFIT_SCRIPT_SRC = "//t1.kakaocdn.net/kas/static/ba.min.js";

/** 카카오 애드핏 콘솔(https://adfit.kakao.com)에서 발급받은 이 사이트 전용 광고 단위 코드 */
export const KAKAO_ADFIT_UNITS = {
  /** 해설 무제한 모달, 공유 진입 모달 (250x250) */
  modal: { unit: "DAN-wmaKSCFvVh6iSe5I", width: 250, height: 250 },
  /** 모바일 하단 배너 (320x50) */
  mobileBanner: { unit: "DAN-ctqbpCkL5AnrfFZY", width: 320, height: 50 },
  /** 데스크탑 하단 배너 (728x90) */
  desktopBanner: { unit: "DAN-rjm8cuVO5tqxkcLZ", width: 728, height: 90 },
} as const;

interface IAdFitModule {
  (): void;
  render: (ins: HTMLElement) => void;
  destroy: (ins: HTMLElement) => void;
}

declare global {
  interface Window {
    adfit?: IAdFitModule;
  }
}

let isAdFitScriptInserted = false;

/**
 * ba.min.js는 로드되면서 문서에 있는 <ins class="kakao_ad_area">를 한 번 스캔해 채운다.
 * 그 뒤에 붙인 <ins>는 자동으로 채워지지 않으므로 window.adfit.render(ins)를 직접 호출해야 한다.
 * - 스크립트 로드 전: <ins>를 DOM에 붙여두면 스크립트 초기화 때 같이 스캔된다
 * - 스크립트 로드 후: render()로 해당 <ins>만 그린다
 * 언마운트 시 destroy()로 정리하지 않으면 같은 광고 단위를 다시 그릴 때 중복으로 취급돼 빈 칸이 된다.
 */
function renderAdFit(ins: HTMLElement) {
  if (window.adfit) {
    window.adfit.render(ins);
    return;
  }
  if (isAdFitScriptInserted) return;
  isAdFitScriptInserted = true;
  const script = document.createElement("script");
  script.src = KAKAO_ADFIT_SCRIPT_SRC;
  script.async = true;
  document.body.appendChild(script);
}

interface IKakaoAdFitProps {
  unit: string;
  width: number;
  height: number;
  className?: string;
}

/**
 * <ins>는 React 바깥에서 광고 스크립트가 내부 DOM을 바꾸므로, React가 관리하지 않는
 * 컨테이너에 직접 만들어 붙인다. unit이 바뀌면 key로 리마운트해서 쓰는 쪽에서 교체한다.
 */
export function KakaoAdFit({ unit, width, height, className }: IKakaoAdFitProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !unit) return;

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", unit);
    ins.setAttribute("data-ad-width", String(width));
    ins.setAttribute("data-ad-height", String(height));
    container.appendChild(ins);
    renderAdFit(ins);

    return () => {
      window.adfit?.destroy(ins);
      ins.remove();
    };
  }, [unit, width, height]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width, height }}
    />
  );
}
