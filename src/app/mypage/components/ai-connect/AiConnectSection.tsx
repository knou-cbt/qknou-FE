"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

import { toast } from "@/components/ui";
import { ApiError } from "@/lib/api-client";

import type { TAiProvider } from "../../interface";
import {
  useAiConnectionsQuery,
  useDeleteAiConnectionMutation,
  useSaveAiConnectionMutation,
  useUpdateActiveAiProviderMutation,
} from "../../hooks/service";
import { MyPageNotice } from "../MyPageNotice";
import { AiProviderCard } from "./AiProviderCard";
import {
  AI_PROVIDER_NAME,
  FREE_AI_PROVIDERS,
  PAID_AI_PROVIDERS,
  type IAiProviderMeta,
} from "./aiProviders";
import {
  exchangeOpenRouterCode,
  hasPendingOpenRouterLogin,
  startOpenRouterLogin,
} from "./openrouterOAuth";

const AI_TAB_PATH = "/mypage?tab=ai";

const SECTION_IDS = {
  free: "ai-connect-free",
  paid: "ai-connect-paid",
  help: "ai-connect-help",
} as const;

const PATH_CARDS = [
  {
    target: SECTION_IDS.paid,
    title: "유료 AI API 키가 있어요",
    description: "OpenAI·Claude 키로 연결",
  },
  {
    target: SECTION_IDS.free,
    title: "무료로 쓰고 싶어요",
    description: "1분이면 무료 AI 연결",
  },
  {
    target: SECTION_IDS.help,
    title: "연결하다 막혔어요",
    description: "자주 생기는 문제 해결",
  },
] as const;

const TROUBLESHOOTING = [
  {
    question: "\"키가 올바르지 않아요\"라고 나와요",
    answer:
      "키가 덜 복사됐거나 앞뒤에 다른 글자가 붙은 경우가 많아요. 발급 화면에서 복사 버튼으로 키 전체를 다시 복사해 붙여넣어 주세요. 제공사 콘솔에서 이미 삭제한 키라면 새로 발급받아야 해요.",
  },
  {
    question: "OpenRouter에서 허용했는데 연결되지 않았어요",
    answer:
      "연결을 시작한 브라우저와 같은 브라우저에서 허용해야 해요. 다른 브라우저나 앱으로 열렸다면 이 화면에서 '브라우저로 연결'을 다시 눌러 주세요.",
  },
  {
    question: "연결했는데 AI가 답하지 않아요",
    answer:
      "무료 AI는 하루 요청 수를 다 쓰면 다음 날까지 멈춰요. 유료 AI는 제공사 콘솔에서 크레딧 잔액과 사용 한도를 확인해 주세요. 급할 때는 AI 학습 도우미 상단의 '답변 AI'에서 '큐노 기본 AI'를 고르면 바로 다시 쓸 수 있어요.",
  },
  {
    question: "ChatGPT Plus나 Claude Pro 구독으로 연결할 수 없나요?",
    answer:
      "월 구독 계정은 웹사이트에서 연결할 수 없어요. 대신 각 회사 개발자 콘솔에서 API 키를 발급받아 연결해 주세요. API 키는 구독과 별개로 사용한 만큼 요금이 나가요. 요금이 부담되면 무료 AI를 연결해 보세요.",
  },
  {
    question: "키를 바꾸고 싶어요",
    answer: "해당 카드에서 '연결 해제'를 누른 뒤 새 키를 붙여넣어 연결하면 돼요.",
  },
] as const;

const SECURITY_NOTES = [
  "키는 암호화해서 저장하고, 화면에는 일부만 가려서 보여줘요.",
  "연결한 키는 큐노 AI 학습 도우미의 답변을 만들 때만 쓰여요.",
  "큐노는 각 회사 계정의 비밀번호를 받지 않아요.",
  "연결을 해제하면 저장된 키를 바로 삭제해요. 제공사 콘솔에서 키를 삭제하면 완전히 끊을 수 있어요.",
] as const;

function getSaveErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 400) {
    return "키가 올바르지 않아요. 키 전체를 다시 복사해 붙여넣어 주세요.";
  }
  return "연결하지 못했어요. 잠시 후 다시 시도해 주세요.";
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export const AiConnectSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading } = useAiConnectionsQuery();
  const saveMutation = useSaveAiConnectionMutation();
  const deleteMutation = useDeleteAiConnectionMutation();
  const activeMutation = useUpdateActiveAiProviderMutation();

  const [connectingProvider, setConnectingProvider] = useState<TAiProvider | null>(null);
  const [errors, setErrors] = useState<Partial<Record<TAiProvider, string>>>({});

  const activeProvider = data?.activeProvider ?? null;
  const connectionByProvider = new Map(
    (data?.connections ?? []).map((connection) => [connection.provider, connection])
  );

  const saveKey = async (provider: TAiProvider, apiKey: string) => {
    setConnectingProvider(provider);
    setErrors((prev) => ({ ...prev, [provider]: undefined }));
    try {
      await saveMutation.mutateAsync({ provider, apiKey });
      toast.success(`${AI_PROVIDER_NAME[provider]}에 연결했어요.`);
    } catch (error) {
      setErrors((prev) => ({ ...prev, [provider]: getSaveErrorMessage(error) }));
    } finally {
      setConnectingProvider(null);
    }
  };

  // OpenRouter 로그인에서 ?code=로 돌아온 경우: 키로 교환해 저장하고 주소에서 code를 지운다.
  // StrictMode 이중 실행 시 같은 code를 두 번 교환하면 두 번째가 실패하므로 ref로 한 번만 처리한다.
  const handledOpenRouterCode = useRef(false);
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || handledOpenRouterCode.current || !hasPendingOpenRouterLogin()) return;
    handledOpenRouterCode.current = true;
    router.replace(AI_TAB_PATH);

    setConnectingProvider("openrouter");
    exchangeOpenRouterCode(code)
      .then((key) => saveKey("openrouter", key))
      .catch(() => {
        setConnectingProvider(null);
        setErrors((prev) => ({
          ...prev,
          openrouter: "OpenRouter 연결을 마치지 못했어요. '브라우저로 연결'을 다시 눌러 주세요.",
        }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 돌아온 직후 한 번만 처리
  }, [searchParams]);

  const handleBrowserConnect = async () => {
    setErrors((prev) => ({ ...prev, openrouter: undefined }));
    await startOpenRouterLogin(`${window.location.origin}${AI_TAB_PATH}`);
  };

  const handleUse = async (provider: TAiProvider | null) => {
    try {
      await activeMutation.mutateAsync(provider);
      toast.success(
        provider ? `이제 ${AI_PROVIDER_NAME[provider]}로 답변해요.` : "큐노 기본 AI로 되돌렸어요."
      );
    } catch {
      toast.error("변경하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const handleDisconnect = async (provider: TAiProvider) => {
    if (!window.confirm(`${AI_PROVIDER_NAME[provider]} 연결을 해제할까요? 저장된 키가 삭제돼요.`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(provider);
      toast.success("연결을 해제했어요.");
    } catch {
      toast.error("연결을 해제하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const renderCards = (providers: IAiProviderMeta[]) => (
    <div className="grid gap-3 md:grid-cols-2">
      {providers.map((meta) => (
        <AiProviderCard
          key={meta.provider}
          meta={meta}
          connection={connectionByProvider.get(meta.provider)}
          isActive={activeProvider === meta.provider}
          isConnecting={connectingProvider === meta.provider}
          errorMessage={errors[meta.provider]}
          onSaveKey={(apiKey) => saveKey(meta.provider, apiKey)}
          onBrowserConnect={handleBrowserConnect}
          onUse={() => handleUse(meta.provider)}
          onDisconnect={() => handleDisconnect(meta.provider)}
        />
      ))}
    </div>
  );

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-[#6B7280]">불러오는 중...</p>;
  }

  return (
    <div className="space-y-8 sm:space-y-10">

      {/* 시작 질문 — 처음 연결하는 사용자용 안내라, 연결된 AI가 하나라도 있으면 숨긴다 */}
      {connectionByProvider.size === 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-[#101828]">어떤 AI를 연결할까요?</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            {PATH_CARDS.map(({ target, title, description }) => (
              <button
                key={target}
                type="button"
                onClick={() => scrollToSection(target)}
                className="cursor-pointer rounded-xl border border-[#DBE4FF] bg-gradient-to-br from-white to-[#E8EEFF] p-4 text-left transition-all hover:border-[#155DFC] hover:to-[#DCE6FF] sm:hover:-translate-y-0.5 sm:hover:shadow-md"
              >
                <p className="text-sm font-semibold text-[#101828]">{title}</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">{description}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 무료 AI */}
      <section id={SECTION_IDS.free} className="scroll-mt-20">
        <h2 className="text-lg font-bold text-[#101828]">무료 AI 연결</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          유료 AI보다 성능이 조금 약하고, 하루에 보낼 수 있는 질문 수에 한도가 있어요.
        </p>
        <MyPageNotice className="mt-3 mb-4">
          무료로 쓰는 동안 보낸 내용은 제공사의 AI 개선에 쓰일 수 있어요. 개인정보는 보내지 마세요.
        </MyPageNotice>
        {renderCards(FREE_AI_PROVIDERS)}
      </section>

      {/* 유료 AI */}
      <section id={SECTION_IDS.paid} className="scroll-mt-20">
        <h2 className="text-lg font-bold text-[#101828]">유료 AI 연결</h2>
        <p className="mt-1 mb-4 text-sm text-[#6B7280]">
          각 회사 개발자 콘솔에서 발급한 API 키로 연결해요. 월 구독과는 별개로 사용한 만큼
          요금이 나가요.
        </p>
        {renderCards(PAID_AI_PROVIDERS)}
      </section>

      {/* 문제 해결 */}
      <section id={SECTION_IDS.help} className="scroll-mt-20">
        <h2 className="mb-3 text-lg font-bold text-[#101828]">연결하다 막혔을 때</h2>
        <div className="divide-y divide-[#F3F4F6] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          {TROUBLESHOOTING.map(({ question, answer }) => (
            <details key={question} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-medium text-[#101828] hover:bg-[#F9FAFB] [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown className="size-4 shrink-0 text-[#9CA3AF] transition-transform group-open:rotate-180" />
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-[#6B7280]">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 보안 안내 */}
      <section className="rounded-xl bg-white p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-bold text-[#101828]">키는 이렇게 보관해요</h2>
        </div>
        <ul className="space-y-2">
          {SECURITY_NOTES.map((note) => (
            <li key={note} className="flex gap-2 text-sm leading-relaxed text-[#4B5563]">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-[#9CA3AF]" />
              {note}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
