"use client";

import { useEffect, useRef, useState } from "react";

import { Modal, ModalContent, ModalHeader, Button } from "@/components/ui";

/**
 * 카카오 애드핏 광고 단위 코드. 카카오 애드핏 콘솔(https://adfit.kakao.com)에서
 * 이 사이트 도메인으로 발급받은 실제 단위 코드로 교체해야 광고가 노출된다.
 * TODO: 실제 data-ad-unit 값으로 교체
 */
const KAKAO_ADFIT_UNIT_ID = "DAN-XXXXXXXXXXXXXXXX";
const KAKAO_ADFIT_WIDTH = 250;
const KAKAO_ADFIT_HEIGHT = 250;
const KAKAO_ADFIT_SCRIPT_SRC = "//t1.daumcdn.net/kas/static/ba.min.js";

interface IAdUnlockModalProps {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

/**
 * Modal은 open=false일 때 children을 렌더하지 않는다 — 아래 Body는 열릴 때마다
 * 새로 마운트되어 클릭 감지 상태가 항상 처음부터 다시 시작한다.
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
  // 광고는 교차 출처 iframe이라 실제 클릭 이벤트를 직접 감지할 수 없다.
  // 단순히 "창이 포커스를 잃었다가 돌아옴"만 보면 Cmd+Tab으로 다른 앱을
  // 갔다 오기만 해도 풀려버린다 — 그래서 blur가 일어난 시점에 포커스가
  // 실제로 "이 iframe 안"으로 들어갔었는지(=진짜 광고를 클릭했는지)까지
  // document.activeElement로 같이 확인한다. iframe을 클릭하면 그 iframe
  // 엘리먼트 자체가 부모 문서의 activeElement가 되는 브라우저 표준 동작을
  // 이용한 것으로, 교차 출처여도 동작한다.
  const [hasLeftAndReturned, setHasLeftAndReturned] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // 애드핏은 <ins class="kakao_ad_area">를 스크립트가 비동기로 스캔해 그 안에
  // iframe을 주입하는 방식이라, 모달이 열릴 때마다 <ins>+<script>를 새로
  // DOM에 삽입해야 매번 다시 렌더된다(리액트 재마운트만으로는 재스캔되지 않음).
  useEffect(() => {
    const container = adContainerRef.current;
    if (!container) return;

    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", KAKAO_ADFIT_UNIT_ID);
    ins.setAttribute("data-ad-width", String(KAKAO_ADFIT_WIDTH));
    ins.setAttribute("data-ad-height", String(KAKAO_ADFIT_HEIGHT));

    const script = document.createElement("script");
    script.src = KAKAO_ADFIT_SCRIPT_SRC;
    script.async = true;

    container.appendChild(ins);
    container.appendChild(script);

    // 애드핏 스크립트가 <ins> 안에 iframe을 주입하는 시점은 비동기이므로 관찰해서 잡는다
    const observer = new MutationObserver(() => {
      const iframe = ins.querySelector("iframe");
      if (iframe) {
        iframeRef.current = iframe;
        observer.disconnect();
      }
    });
    observer.observe(ins, { childList: true });

    return () => {
      observer.disconnect();
      container.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    let adWasClicked = false;

    const handleBlur = () => {
      // blur 이벤트 시점엔 activeElement가 아직 안 바뀌어 있을 수 있어 다음 tick에 확인
      window.setTimeout(() => {
        if (document.activeElement === iframeRef.current) {
          adWasClicked = true;
        }
      }, 0);
    };
    const handleFocus = () => {
      if (adWasClicked) setHasLeftAndReturned(true);
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <ModalContent size="md">
      <ModalHeader showCloseButton onClose={onClose}>
        해설 무제한 보기
      </ModalHeader>

      <p className="mb-4 text-sm text-[#6B7280]">
        아래 광고를 <strong className="text-[#374151]">클릭</strong>하면 30분
        동안 모든 해설을 무제한으로 볼 수 있어요. 광고 클릭 후 이 창으로
        돌아오면 버튼이 활성화돼요.
      </p>

      <div ref={adContainerRef} className="flex justify-center py-2" />

      <Button
        onClick={onUnlocked}
        disabled={!hasLeftAndReturned}
        className="mt-4 w-full"
      >
        {hasLeftAndReturned
          ? "30분 무제한 해설 받기"
          : "광고를 클릭하면 활성화돼요"}
      </Button>
    </ModalContent>
  );
};
