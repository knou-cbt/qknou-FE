"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/contexts";
import { AI_PROVIDER_NAME } from "@/app/mypage/components/ai-connect/aiProviders";
import {
  useAiConnectionsQuery,
  useUpdateActiveAiProviderMutation,
} from "@/app/mypage/hooks/service";
import type { TAiProvider } from "@/app/mypage/interface";

import { CHATBOT_QUESTION_LIMIT } from "./chatbotPanel.utils";

const AI_CONNECT_PATH = "/mypage?tab=ai";
const DEFAULT_AI_LABEL = "큐노 기본 AI";

interface IChatbotAiSelectorProps {
  /** 마이페이지로 이동할 때 패널을 닫기 위해 */
  onNavigate: () => void;
  disabled?: boolean;
}

/**
 * 입력창 위 "답변 AI" 드롭다운. 메뉴는 위로 열린다.
 * - 큐노 기본 AI(하루 횟수 제한) + 연결한 AI(횟수 제한 없음) 중에서 고른다
 * - 마이페이지 "이 AI 사용하기"와 같은 API로 저장한다
 */
export function ChatbotAiSelector({ onNavigate, disabled }: IChatbotAiSelectorProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data } = useAiConnectionsQuery();
  const activeMutation = useUpdateActiveAiProviderMutation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isAuthenticated || !data) return null;

  const activeProvider = data.activeProvider;
  const hasConnections = data.connections.length > 0;
  const options: { provider: TAiProvider | null; label: string; hint: string }[] = [
    {
      provider: null,
      label: DEFAULT_AI_LABEL,
      hint: `하루 ${CHATBOT_QUESTION_LIMIT}회`,
    },
    ...data.connections.map((connection) => ({
      provider: connection.provider,
      label: AI_PROVIDER_NAME[connection.provider],
      hint: "횟수 제한 없음",
    })),
  ];

  const goToAiConnect = () => {
    setIsOpen(false);
    onNavigate();
    router.push(AI_CONNECT_PATH);
  };

  const handleSelect = async (provider: TAiProvider | null) => {
    setIsOpen(false);
    if (provider === activeProvider) return;
    try {
      await activeMutation.mutateAsync(provider);
    } catch {
      toast.error("답변 AI를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const activeLabel = activeProvider ? AI_PROVIDER_NAME[activeProvider] : DEFAULT_AI_LABEL;

  return (
    <div className="relative mb-2" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled || activeMutation.isPending}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`답변 AI 선택: ${activeLabel}`}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
          "disabled:cursor-not-allowed disabled:opacity-50",
          activeProvider
            ? "border-[#C7D2FE] bg-[#EEF2FF] text-[#4338CA] hover:bg-[#E0E7FF]"
            : "border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6]"
        )}
      >
        <Sparkles className="size-3.5" aria-hidden />
        {activeLabel}
        <ChevronDown
          className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 z-10 mb-1.5 w-60 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
          <p className="px-3 pb-1 pt-1.5 text-[11px] font-medium text-[#9CA3AF]">답변 AI</p>
          <ul role="listbox" aria-label="답변 AI">
            {options.map((option) => {
              const selected = option.provider === activeProvider;
              return (
                <li key={option.provider ?? "default"}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => void handleSelect(option.provider)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#F9FAFB]",
                      selected ? "text-[#111827]" : "text-[#374151]"
                    )}
                  >
                    <span className="flex size-4 shrink-0 items-center justify-center">
                      {selected && <Check className="size-4 text-[#5D50FF]" />}
                    </span>
                    <span className={cn("flex-1", selected && "font-medium")}>
                      {option.label}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">{option.hint}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 border-t border-[#F3F4F6] pt-1">
            <button
              type="button"
              onClick={goToAiConnect}
              className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-xs font-medium text-[#155DFC] hover:bg-[#F9FAFB]"
            >
              {hasConnections ? "내 AI 관리" : "내 AI 연결하고 무제한으로 질문하기"}
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
