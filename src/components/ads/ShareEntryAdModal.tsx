"use client";

import { useState } from "react";

import { Modal, ModalContent, Button } from "@/components/ui";
import { KakaoAdFit, KAKAO_ADFIT_UNITS } from "@/components/ads/KakaoAdFit";

/** 세션(탭)당 1회만 노출되도록 하는 플래그 */
const SESSION_STORAGE_KEY = "qknou:shareEntryAdShown";

function hasShownThisSession(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}

function markShownThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}

/** 공유 링크로 문항 상세 화면에 처음 접속했을 때 1회 노출하는 광고 모달 훅 */
export function useShareEntryAdModal() {
  // SSR에서는 항상 false(=닫힘)로 렌더되고, 클라이언트 첫 렌더에서 세션 플래그를
  // 확인해 아직 안 보여줬다면 그 자리에서 true로 열고 플래그를 남긴다.
  const [open, setOpen] = useState(() => {
    if (hasShownThisSession()) return false;
    markShownThisSession();
    return true;
  });

  return { open, onClose: () => setOpen(false) };
}

interface IShareEntryAdModalProps {
  open: boolean;
  onClose: () => void;
}

export const ShareEntryAdModal = ({ open, onClose }: IShareEntryAdModalProps) => {
  return (
    // 바깥 클릭으로 닫히지 않도록 Modal에는 아무 동작도 하지 않는 onClose를 넘기고,
    // 실제 닫기는 아래 "문제 보러 가기" 버튼에서만 하도록 한다
    <Modal open={open} onClose={() => {}}>
      <ModalContent size="sm">
        <div className="flex justify-center py-2">
          <KakaoAdFit {...KAKAO_ADFIT_UNITS.modal} />
        </div>

        <Button onClick={onClose} className="mt-4 w-full">
          문제 보러 가기
        </Button>
      </ModalContent>
    </Modal>
  );
};
