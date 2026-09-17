"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Pagination } from "@/components/ui";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import { useBookmarkListQuery } from "@/components/bookmark/hooks/service";

import { MyPageCard } from "./MyPageCard";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const bookmarks = (data ?? []).filter((b) => !hiddenIds.has(b.questionId));

  const pageCount = Math.max(Math.ceil(bookmarks.length / pageSize), 1);
  const clampedPageIndex = Math.min(pageIndex, pageCount - 1);
  const pageItems = bookmarks.slice(
    clampedPageIndex * pageSize,
    clampedPageIndex * pageSize + pageSize
  );

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
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pageItems.map((bookmark) => (
          <MyPageCard
            key={bookmark.questionId}
            onClick={() => router.push(`/memorize/${bookmark.questionId}`)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-baseline gap-2">
                <p className="shrink-0 truncate text-sm font-semibold text-[#101828]">
                  {bookmark.subjectName}
                </p>
                <p className="truncate text-xs text-[#9CA3AF]">{bookmark.examTitle}</p>
              </div>
              <BookmarkButton
                questionId={bookmark.questionId}
                active
                size="sm"
                onToggled={(next) => {
                  if (!next) {
                    setHiddenIds((prev) => new Set(prev).add(bookmark.questionId));
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

      {bookmarks.length > 0 && (
        <Pagination
          pageIndex={clampedPageIndex}
          pageCount={pageCount}
          onPageIndexChange={setPageIndex}
          pageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageIndex(0);
          }}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          bare
        />
      )}
    </div>
  );
};
