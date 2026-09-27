"use client";

import { useEffect, useRef, useState } from "react";

import { Modal, ModalContent, ModalHeader, Button } from "@/components/ui";

/** 카카오 애드핏 콘솔(https://adfit.kakao.com)에서 발급받은 이 사이트 전용 광고 단위 코드 */
const KAKAO_ADFIT_UNIT_ID = "DAN-wmaKSCFvVh6iSe5I";
const KAKAO_ADFIT_WIDTH = 250;
const KAKAO_ADFIT_HEIGHT = 250;
const KAKAO_ADFIT_SCRIPT_SRC = "//t1.kakaocdn.net/kas/static/ba.min.js";

/**
 * ba.min.js는 `if (!("adfit" in self))`로 자기 자신을 감싸서, 페이지에서 딱 한 번만
 * <ins class="kakao_ad_area">들을 스캔해 iframe을 주입하고 그 뒤로는 스크립트를 몇 번을
 * 더 넣어도 아무 일도 하지 않는다. 그래서 모달을 열 때마다 <ins>+<script>를 새로 만들면
 * 정확히 "맨 처음 한 번"만 광고가 뜨고, 두 번째 오픈부터는 영영 빈 칸으로 남는다.
 * → <ins>는 페이지에 딱 하나만(모듈 스코프 싱글턴) 만들고, 모달이 열릴 때마다 그 DOM
 *   노드를 현재 모달의 컨테이너로 옮겨(appendChild) 재사용한다. 스크립트도 최초 1회만 삽입.
 */
let sharedAdInsNode: HTMLElement | null = null;
let isAdFitScriptInserted = false;

function getSharedAdInsNode(): HTMLElement {
  if (!sharedAdInsNode) {
    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", KAKAO_ADFIT_UNIT_ID);
    ins.setAttribute("data-ad-width", String(KAKAO_ADFIT_WIDTH));
    ins.setAttribute("data-ad-height", String(KAKAO_ADFIT_HEIGHT));
    sharedAdInsNode = ins;
  }
  return sharedAdInsNode;
}

function ensureAdFitScriptLoaded() {
  if (isAdFitScriptInserted) return;
  isAdFitScriptInserted = true;
  const script = document.createElement("script");
  script.src = KAKAO_ADFIT_SCRIPT_SRC;
  script.async = true;
  document.body.appendChild(script);
}

/**
 * 광고 클릭 여부를 blur/focus로 추정하던 기존 방식은 (1) 크로스오리진이라 오탐이
 * 잦고 (2) "클릭하면 보상"은 대부분의 광고 정책(카카오 애드핏 포함)이 금지하는
 * 유도 클릭에 해당할 수 있다. 그래서 클릭 감지 대신, 광고를 일정 시간 노출하면
 * 그냥 풀어주는 타이머 방식으로 바꾼다.
 */
const AD_VIEW_SECONDS = 5;

interface IAdUnlockModalProps {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

/**
 * Modal은 open=false일 때 children을 렌더하지 않는다 — 아래 Body는 열릴 때마다
 * 새로 마운트되어 카운트다운이 항상 처음부터 다시 시작한다.
 */
export const AdUnlockModal = ({ open, onClose, onUnlocked }: IAdUnlockModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      {open && <AdUnlockModalBody onClose={onClose} onUnlocked={onUnlocked} />}
    </Modal>
  );
};

const AdUnlockModalBody = ({
  onClose,
  onUnlocked,
}: {
  onClose: () => void;
  onUnlocked: () => void;
}) => {
  const [secondsLeft, setSecondsLeft] = useState(AD_VIEW_SECONDS);
  const adContainerRef = useRef<HTMLDivElement>(null);

  // 모달을 열 때마다 공유 <ins> 노드를 이 컨테이너로 옮겨 붙인다. 이미 이전 오픈에서
  // 광고가 로드돼 있으면 바로 보이고, 최초 1회라면 이제서야 스크립트가 스캔해서 채운다.
  useEffect(() => {
    const container = adContainerRef.current;
    if (!container) return;

    const ins = getSharedAdInsNode();
    container.appendChild(ins);
    ensureAdFitScriptLoaded();

    // container.innerHTML은 지우지 않는다 — ins는 공유 노드라 다음에 열릴 모달이
    // 그대로 재사용해야 한다. React가 container 자체를 언마운트하면서 ins도 함께
    // DOM에서 떨어져 나가고, 다음 오픈 때 위 effect가 다시 appendChild로 살려 붙인다.
  }, []);

  // 광고를 AD_VIEW_SECONDS만큼 노출하면 클릭 여부와 무관하게 풀어준다
  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const isUnlockable = secondsLeft <= 0;

  return (
    <ModalContent size="md">
      <ModalHeader showCloseButton onClose={onClose}>
        해설 무제한 보기
      </ModalHeader>

      <p className="mb-4 text-sm text-[#6B7280]">
        아래 광고가 <strong className="text-[#374151]">{AD_VIEW_SECONDS}초</strong>간
        노출되고 나면 30분 동안 모든 해설을 무제한으로 볼 수 있어요.
      </p>

      <div ref={adContainerRef} className="flex justify-center py-2" />

      <Button
        onClick={onUnlocked}
        disabled={!isUnlockable}
        className="mt-4 w-full"
      >
        {isUnlockable ? "30분 무제한 해설 받기" : `${secondsLeft}초 후 활성화돼요`}
      </Button>
    </ModalContent>
  );
};
