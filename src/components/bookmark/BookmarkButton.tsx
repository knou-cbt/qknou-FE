"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";

import { cn } from "@/lib/utils";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { ApiError } from "@/lib/api-client";
import { toast } from "@/components/ui/toast";

import { useToggleBookmarkMutation } from "./hooks/service";

interface IBookmarkButtonProps {
  questionId: number;
  /** 서버/부모가 알고 있는 현재 북마크 상태 */
  active: boolean;
  /** 토글 성공 시 알림 (마이페이지 목록에서 즉시 제거 등) */
  onToggled?: (next: boolean) => void;
  size?: "sm" | "md";
  className?: string;
}

const sizeClass = {
  sm: "size-8",
  md: "size-10",
};

const iconSizeClass = {
  sm: "size-4",
  md: "size-5",
};

export const BookmarkButton = ({
  questionId,
  active,
  onToggled,
  size = "md",
  className,
}: IBookmarkButtonProps) => {
  const requireAuth = useRequireAuth();
  const mutation = useToggleBookmarkMutation();
  const [optimisticActive, setOptimisticActive] = useState(active);

  useEffect(() => {
    setOptimisticActive(active);
  }, [active]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    requireAuth(() => {
      const next = !optimisticActive;
      setOptimisticActive(next);
      mutation.mutate(
        { questionId, next },
        {
          onError: (error) => {
            setOptimisticActive(!next);
            if (error instanceof ApiError && error.status === 401) return; // 전역 401 핸들러가 처리
            toast.error(
              next
                ? "북마크에 실패했습니다. 잠시 후 다시 시도해 주세요."
                : "북마크 해제에 실패했습니다. 잠시 후 다시 시도해 주세요."
            );
          },
          onSuccess: () => onToggled?.(next),
        }
      );
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={optimisticActive}
      aria-label={optimisticActive ? "북마크 해제" : "북마크에 추가"}
      className={cn(
        "flex items-center justify-center rounded-full transition-colors cursor-pointer hover:bg-[#F3F4F6]",
        sizeClass[size],
        className
      )}
    >
      <Bookmark
        className={cn(
          iconSizeClass[size],
          optimisticActive
            ? "fill-[#155DFC] text-[#155DFC]"
            : "text-[#9CA3AF]"
        )}
      />
    </button>
  );
};
