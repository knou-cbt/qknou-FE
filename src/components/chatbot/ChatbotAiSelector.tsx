"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/contexts";
import { AI_PROVIDER_NAME } from "@/app/mypage/components/ai-connect/aiProviders";
import {
  useAiConnectionsQuery,
  useUpdateActiveAiProviderMutation,
} from "@/app/mypage/hooks/service";
import type { TAiProvider } from "@/app/mypage/interface";

const AI_CONNECT_PATH = "/mypage?tab=ai";
/** Select는 문자열 값만 다루므로 "큐노 기본 AI"(activeProvider null)를 빈 문자열로 표현 */
const DEFAULT_AI_VALUE = "";

interface IChatbotAiSelectorProps {
  /** 마이페이지로 이동할 때 패널을 닫기 위해 */
  onNavigate: () => void;
}

/**
 * 챗봇 헤더 아래 "답변 AI" 줄.
 * - 연결한 AI가 없으면: 기본 AI로 답한다는 안내 + 마이페이지 AI 연결 탭 링크
 * - 있으면: 큐노 기본 AI + 연결한 AI 중에서 고르는 셀렉트박스 (마이페이지 "이 AI 사용하기"와 같은 API)
 */
export function ChatbotAiSelector({ onNavigate }: IChatbotAiSelectorProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data } = useAiConnectionsQuery();
  const activeMutation = useUpdateActiveAiProviderMutation();

  if (!isAuthenticated || !data) return null;

  const goToAiConnect = () => {
    onNavigate();
    router.push(AI_CONNECT_PATH);
  };

  if (data.connections.length === 0) {
    return (
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#F3F4F6] bg-[#F9FAFB] px-4 py-2 text-xs">
        <span className="text-[#6B7280]">큐노 기본 AI로 답변해요</span>
        <button
          type="button"
          onClick={goToAiConnect}
          className="inline-flex cursor-pointer items-center gap-0.5 font-medium text-[#155DFC] hover:underline"
        >
          내 AI 연결하기
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    );
  }

  const options = [
    { value: DEFAULT_AI_VALUE, label: "큐노 기본 AI" },
    ...data.connections.map((connection) => ({
      value: connection.provider,
      label: AI_PROVIDER_NAME[connection.provider],
    })),
  ];

  const handleChange = async (value: string) => {
    const provider = value === DEFAULT_AI_VALUE ? null : (value as TAiProvider);
    try {
      await activeMutation.mutateAsync(provider);
    } catch {
      toast.error("답변 AI를 바꾸지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-[#F3F4F6] bg-[#F9FAFB] px-4 py-2">
      <span className="shrink-0 text-xs text-[#6B7280]">답변 AI</span>
      <div className="min-w-0 flex-1">
        <Select
          aria-label="답변 AI 선택"
          options={options}
          value={data.activeProvider ?? DEFAULT_AI_VALUE}
          onChange={handleChange}
          disabled={activeMutation.isPending}
        />
      </div>
      <button
        type="button"
        onClick={goToAiConnect}
        className="shrink-0 cursor-pointer text-xs font-medium text-[#155DFC] hover:underline"
      >
        관리
      </button>
    </div>
  );
}
