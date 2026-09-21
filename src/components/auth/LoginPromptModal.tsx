"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Modal, ModalContent, ModalHeader, ModalFooter, Button } from "@/components/ui";
import { hideLoginPrompt, subscribeLoginPrompt } from "@/lib/loginPrompt";
import { POST_LOGIN_REDIRECT_KEY } from "@/lib/auth-token";

/** AppContent에 한 번 마운트 — useRequireAuth가 비로그인 시 여는 안내 모달 */
export const LoginPromptModal = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => subscribeLoginPrompt(setOpen), []);

  const handleConfirm = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        POST_LOGIN_REDIRECT_KEY,
        window.location.pathname + window.location.search
      );
    }
    hideLoginPrompt();
    router.push("/auth/login");
  };

  return (
    <Modal open={open} onClose={hideLoginPrompt}>
      {open && (
        <ModalContent size="sm">
          <ModalHeader showCloseButton onClose={hideLoginPrompt}>
            로그인이 필요해요
          </ModalHeader>
          <p className="text-sm leading-6 text-[#374151]">
            로그인 후 가능한 기능입니다.
            <br />
            로그인 하시겠습니까?
          </p>
          <ModalFooter className="mt-6">
            <Button variant="outline" onClick={hideLoginPrompt} className="flex-1">
              취소
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              로그인
            </Button>
          </ModalFooter>
        </ModalContent>
      )}
    </Modal>
  );
};
