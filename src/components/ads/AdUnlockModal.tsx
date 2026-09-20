"use client";

import { useEffect, useState } from "react";

import { Modal, ModalContent, ModalHeader, Button } from "@/components/ui";
import { CoupangDisclosure } from "@/components/coupang-ad";

const COUPANG_WIDGET_SRC = "https://coupa.ng/cpDlEB";

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
  // 대신 "광고를 클릭 → 새 탭/광고주 페이지로 이동 → 이 창으로 복귀"할 때
  // 발생하는 탭 비활성화→재활성화를 클릭의 근사 신호로 사용한다.
  const [hasLeftAndReturned, setHasLeftAndReturned] = useState(false);

  useEffect(() => {
    let hasLeft = false;

    const markLeft = () => {
      hasLeft = true;
    };
    const markReturned = () => {
      if (hasLeft) setHasLeftAndReturned(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) markLeft();
      else markReturned();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", markLeft);
    window.addEventListener("focus", markReturned);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", markLeft);
      window.removeEventListener("focus", markReturned);
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

      <div className="flex justify-center py-2">
        <iframe
          src={COUPANG_WIDGET_SRC}
          width={120}
          height={240}
          frameBorder="0"
          scrolling="no"
          referrerPolicy="unsafe-url"
          title="쿠팡 파트너스 광고"
        />
      </div>

      <CoupangDisclosure className="mt-2" />

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
