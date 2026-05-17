"use client";

import { useState } from "react";
import { Check, PartyPopper } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui";
import { cn } from "@/lib/utils";

/** localStorage 값: 다음 로컬 00:00 시각(ms) */
const NOTICE_STORAGE_KEY = "qknou:subject-update-notice:dismissed-until";

export const UPDATED_SUBJECTS = [
  "정보통신망",
  "소프트웨어공학",
  "알고리즘",
  "운영체제",
  "이산수학",
] as const;

const CONFETTI_DOTS = [
  { className: "top-0 left-2 size-2 bg-[#F9A8D4]" },
  { className: "top-1 right-0 size-1.5 bg-[#C4B5FD]" },
  { className: "top-6 -left-1 size-1.5 bg-[#93C5FD]" },
  { className: "bottom-2 right-2 size-2 bg-[#FDE68A]" },
  { className: "bottom-0 left-6 size-1 bg-[#FDA4AF]" },
] as const;

const SUBJECT_CARD_ACCENTS = [
  { border: "border-l-[#155DFC]", badge: "bg-[#EFF6FF] text-[#155DFC]" },
  { border: "border-l-[#F472B6]", badge: "bg-[#FDF2F8] text-[#DB2777]" },
  { border: "border-l-[#8B5CF6]", badge: "bg-[#F5F3FF] text-[#7C3AED]" },
  { border: "border-l-[#22C55E]", badge: "bg-[#F0FDF4] text-[#16A34A]" },
  { border: "border-l-[#F59E0B]", badge: "bg-[#FFFBEB] text-[#D97706]" },
] as const;

function getNextLocalMidnightMs() {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

function shouldShowNotice() {
  try {
    const raw = localStorage.getItem(NOTICE_STORAGE_KEY);
    if (!raw) return true;

    const dismissedUntil = Number(raw);
    if (!Number.isFinite(dismissedUntil)) {
      localStorage.removeItem(NOTICE_STORAGE_KEY);
      return true;
    }

    if (Date.now() >= dismissedUntil) {
      localStorage.removeItem(NOTICE_STORAGE_KEY);
      return true;
    }

    return false;
  } catch {
    return true;
  }
}

function dismissUntilMidnight() {
  localStorage.setItem(NOTICE_STORAGE_KEY, String(getNextLocalMidnightMs()));
}

export const SubjectUpdateNoticeModal = () => {
  const [open, setOpen] = useState(shouldShowNotice);
  const [hideForDay, setHideForDay] = useState(false);

  const handleClose = () => {
    if (hideForDay) {
      try {
        dismissUntilMidnight();
      } catch {
        // ignore
      }
    }
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalContent
        size="sm"
        className={cn(
          "relative max-w-[320px] overflow-visible rounded-3xl border-0",
          "px-6 pb-6 pt-14 text-center shadow-2xl"
        )}
      >
        {/* 상단 축하 일러스트 */}
        <div
          className="pointer-events-none absolute -top-11 left-1/2 z-20 -translate-x-1/2"
          aria-hidden
        >
          <div className="relative flex size-24 items-center justify-center">
            {CONFETTI_DOTS.map((dot) => (
              <span
                key={dot.className}
                className={cn(
                  "absolute rounded-full opacity-90",
                  dot.className
                )}
              />
            ))}
            <div className="flex size-18 items-center justify-center rounded-full bg-linear-to-br from-[#FDF2F8] to-[#FCE7F3] shadow-md ring-4 ring-white">
              <PartyPopper
                className="size-10 text-[#F472B6]"
                strokeWidth={1.75}
              />
            </div>
          </div>
        </div>

        <h2 className="mt-2 text-[1.35rem] font-bold leading-snug text-[#101828]">
          업데이트 과목
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[#6B7280]">
          여러분 큐노 이용해주셔서 감사합니다. <br /> 시험기간 화이팅입니다!
        </p>

        <div className="mt-5">
          <ul className="flex flex-col gap-2">
            {UPDATED_SUBJECTS.map((subject, index) => {
              const accent = SUBJECT_CARD_ACCENTS[index % SUBJECT_CARD_ACCENTS.length];

              return (
                <li
                  key={subject}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-left shadow-sm",
                  )}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#F9FAFB] text-xs font-bold text-[#6B7280]">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-[#101828]">
                    {subject}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide",
                      "border-l-[#155DFC] bg-[#EFF6FF] text-[#155DFC]"
                    )}
                  >
                    NEW
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-4 text-xs text-[#9CA3AF]">
          과목명을 선택해 연도별 문제를 확인하세요
        </p>

        <label className="mt-5 flex cursor-pointer select-none items-center justify-center gap-2.5 text-sm text-[#6B7280]">
          <input
            type="checkbox"
            checked={hideForDay}
            onChange={(e) => setHideForDay(e.target.checked)}
            className="sr-only"
          />
          <span
            className={cn(
              "flex size-[18px] shrink-0 items-center justify-center rounded border-2 transition-colors",
              hideForDay
                ? "border-[#1F2937] bg-[#1F2937]"
                : "border-[#D1D5DB] bg-white"
            )}
            aria-hidden
          >
            {hideForDay ? (
              <Check className="size-3.5 text-white" strokeWidth={3} />
            ) : null}
          </span>
          하루 동안 안 보기
        </label>

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 h-12 w-full cursor-pointer rounded-full bg-[#1F2937] text-sm font-semibold text-white transition-colors hover:bg-[#111827] active:bg-black"
        >
          확인
        </button>
      </ModalContent>
    </Modal>
  );
};
