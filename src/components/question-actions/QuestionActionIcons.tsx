"use client";

import { Flag, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "@/components/ui";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";

interface IQuestionActionIconsProps {
  questionId: number;
  shareUrl: string;
  bookmarkActive: boolean;
  onBookmarkToggled?: (next: boolean) => void;
  onReport: () => void;
  className?: string;
}

const iconButtonClassName =
  "flex size-8 items-center justify-center rounded-full text-[#6B7280] transition-colors cursor-pointer hover:bg-[#F3F4F6]";

/** 암기모드/문항 공유 화면 공통: 제보 · 공유 · 북마크 아이콘 3종 */
export const QuestionActionIcons = ({
  questionId,
  shareUrl,
  bookmarkActive,
  onBookmarkToggled,
  onReport,
  className,
}: IQuestionActionIconsProps) => {
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url: shareUrl });
        return;
      } catch {
        // 사용자가 공유를 취소한 경우 등 — 클립보드 복사로 폴백하지 않고 종료
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("링크가 복사되었습니다.");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={onReport}
        aria-label="문항 오류 제보"
        className={iconButtonClassName}
      >
        <Flag className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => void handleShare()}
        aria-label="문항 공유"
        className={iconButtonClassName}
      >
        <Share2 className="size-4" />
      </button>
      <BookmarkButton
        questionId={questionId}
        active={bookmarkActive}
        onToggled={onBookmarkToggled}
        size="sm"
      />
    </div>
  );
};
