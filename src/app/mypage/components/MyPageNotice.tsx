import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

/** 마이페이지 섹션 상단의 안내 문구 박스 (풀이 기록 보관 정책, 무료 AI 데이터 활용 안내 등) */
export function MyPageNotice({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg bg-[#EFF6FF] px-3 py-2.5 text-xs text-[#1E3A8A] sm:text-sm",
        className
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-[#3B82F6]" />
      <p>{children}</p>
    </div>
  );
}
