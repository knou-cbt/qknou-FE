"use client";

import { useEffect, useState } from "react";

import { Modal, ModalContent, ModalHeader, Button } from "@/components/ui";
import { KakaoAdFit, KAKAO_ADFIT_UNITS } from "@/components/ads/KakaoAdFit";

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

      <div className="flex justify-center py-2">
        <KakaoAdFit {...KAKAO_ADFIT_UNITS.modal} />
      </div>

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
