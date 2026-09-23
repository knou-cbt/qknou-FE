"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { useBookmarkListQuery } from "@/components/bookmark/hooks/service";
import { groupBySubject } from "@/components/bookmark/groupBySubject";
import type { IBookmarkItem } from "@/components/bookmark/interface";
import { EXAM_TYPE_LABEL } from "@/constants";

import { MyPageCard } from "./MyPageCard";

/** 내부 파일명(examTitle) 대신 보여줄 라벨. year/examType이 아직 없으면 examTitle로 대체 */
function examLabel(bookmark: IBookmarkItem) {
  if (bookmark.year === undefined || bookmark.examType === undefined) {
    return bookmark.examTitle;
  }
  const typeLabel = EXAM_TYPE_LABEL[bookmark.examType] ?? "";
  return `${bookmark.year}년 · ${typeLabel}`;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export const BookmarkListSection = () => {
  const router = useRouter();
  const { data, isLoading } = useBookmarkListQuery();
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());

  const bookmarks = (data ?? []).filter((b) => !hiddenIds.has(b.questionId));
  const groups = useMemo(() => groupBySubject(bookmarks), [bookmarks]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex animate-pulse flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-[#E5E7EB]" />
                <div className="h-3 w-1/3 rounded bg-[#F3F4F6]" />
              </div>
              <div className="size-8 shrink-0 rounded-full bg-[#F3F4F6]" />
            </div>
            <div className="space-y-2 border-l-2 border-[#F3F4F6] pl-3">
              <div className="h-3 w-full rounded bg-[#F3F4F6]" />
              <div className="h-3 w-4/5 rounded bg-[#F3F4F6]" />
            </div>
            <div className="h-3 w-24 rounded bg-[#F3F4F6]" />
          </div>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white p-10 text-center">
        <p className="text-[#6B7280]">북마크한 문항이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B7280]">총 {bookmarks.length}개</p>
        <Button
          size="sm"
          onClick={() => router.push("/mypage/bookmarks/review")}
        >
          과목별 복습
        </Button>
      </div>

      {groups.map(([subjectName, items]) => (
        <div key={subjectName}>
          <h3 className="mb-3 text-sm font-semibold text-[#101828]">
            {subjectName}{" "}
            <span className="font-normal text-[#9CA3AF]">({items.length})</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((bookmark) => (
              <MyPageCard
                key={bookmark.questionId}
                onClick={() => router.push(`/memorize/${bookmark.questionId}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-baseline gap-2">
                    <p className="shrink-0 truncate text-sm font-semibold text-[#101828]">
                      {bookmark.subjectName}
                    </p>
                    <p className="truncate text-xs text-[#9CA3AF]">
                      {examLabel(bookmark)}
                    </p>
                  </div>
                  <BookmarkButton
                    questionId={bookmark.questionId}
                    active
                    size="sm"
                    onToggled={(next) => {
                      if (!next) {
                        setHiddenIds((prev) =>
                          new Set(prev).add(bookmark.questionId)
                        );
                      }
                    }}
                  />
                </div>

                <p className="border-l-2 border-[#E5E7EB] pl-3 text-sm leading-6 text-[#374153] line-clamp-2">
                  {bookmark.questionText}
                </p>

                <p className="text-xs text-[#9CA3AF]">
                  {formatDate(bookmark.bookmarkedAt)}
                </p>
              </MyPageCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
