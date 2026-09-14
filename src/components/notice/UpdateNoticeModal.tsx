"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Modal, ModalContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import { preserveLineBreaksForMarkdown } from "@/lib/math-text";

import { useActiveNoticesQuery } from "./hooks/service";
import type { INotice } from "./interface";

/** localStorage 값: { [noticeId]: 다음 로컬 00:00 시각(ms) } */
const DISMISSED_STORAGE_KEY = "qknou:notice:dismissed";

type TDismissedMap = Record<string, number>;

function readDismissedMap(): TDismissedMap {
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as TDismissedMap)
      : {};
  } catch {
    return {};
  }
}

function getNextLocalMidnightMs() {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

function isDismissed(map: TDismissedMap, id: number) {
  const until = map[String(id)];
  return typeof until === "number" && Date.now() < until;
}

function NoticeItem({ notice }: { notice: INotice }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-[#101828]">
        {notice.title}
      </h3>
      <div className="mt-2 text-sm leading-6 text-[#4B5563] [&_a]:text-[#155DFC] [&_a]:underline [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:list-disc">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {preserveLineBreaksForMarkdown(notice.content)}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export const UpdateNoticeModal = () => {
  const [mounted, setMounted] = useState(false);
  const [closedManually, setClosedManually] = useState(false);
  const [hideForDay, setHideForDay] = useState(false);
  const { data } = useActiveNoticesQuery();

  useEffect(() => {
    // CLS 방지: 첫 페인트 이후 노출
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const visibleNotices = useMemo(() => {
    if (!data || data.length === 0) return [];
    const dismissedMap = readDismissedMap();
    return data.filter((notice) => !isDismissed(dismissedMap, notice.id));
  }, [data]);

  const open = mounted && !closedManually && visibleNotices.length > 0;

  const handleClose = () => {
    if (hideForDay && visibleNotices.length > 0) {
      try {
        const map = readDismissedMap();
        const until = getNextLocalMidnightMs();
        visibleNotices.forEach((notice) => {
          map[String(notice.id)] = until;
        });
        localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(map));
      } catch {
        // ignore
      }
    }
    setClosedManually(true);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalContent size="md" className="max-h-[80vh] overflow-y-auto">
        <div className="flex flex-col gap-5 divide-y divide-[#F3F4F6]">
          {visibleNotices.map((notice, index) => (
            <div key={notice.id} className={cn(index > 0 && "pt-5")}>
              <NoticeItem notice={notice} />
            </div>
          ))}
        </div>

        <label className="mt-5 flex cursor-pointer select-none items-center gap-2.5 text-sm text-[#6B7280]">
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
