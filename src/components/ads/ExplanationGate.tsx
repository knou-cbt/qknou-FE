"use client";

import { useState } from "react";

import { useExplanationUnlock } from "@/lib/explanation-unlock";

import { AdUnlockModal } from "./AdUnlockModal";

interface IExplanationGateProps {
  children: React.ReactNode;
}

/** 해설 콘텐츠를 감싸서, 잠금 해제(광고 시청) 전에는 블러 처리하고 CTA를 보여준다 */
export const ExplanationGate = ({ children }: IExplanationGateProps) => {
  const { isUnlocked, unlockFor30Min } = useExplanationUnlock();
  const [modalOpen, setModalOpen] = useState(false);

  if (isUnlocked) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-[12px]">
      <div aria-hidden className="pointer-events-none select-none blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 px-4 text-center backdrop-blur-[1px]">
        <p className="text-sm font-medium text-[#374151]">
          광고를 클릭하면 30분 동안 해설을 무제한으로 볼 수 있어요
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="cursor-pointer rounded-full bg-[#155DFC] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1447E6]"
        >
          해설 보기
        </button>
      </div>

      <AdUnlockModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUnlocked={() => {
          unlockFor30Min();
          setModalOpen(false);
        }}
      />
    </div>
  );
};
