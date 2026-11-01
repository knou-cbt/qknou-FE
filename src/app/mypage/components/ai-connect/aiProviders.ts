import type { TAiProvider } from "../../interface";

export type TAiConnectMethod = "browser" | "apiKey";

export interface IAiProviderMeta {
  provider: TAiProvider;
  name: string;
  /** 카드 제목 옆 배지 */
  badge?: string;
  description: string;
  method: TAiConnectMethod;
  /** method가 apiKey일 때: 키를 발급받는 곳 */
  keyIssueUrl?: string;
  keyIssueLabel?: string;
  keyPlaceholder?: string;
  /** 카드 하단에 보여줄 주의사항 */
  notes: string[];
}

/** 무료로 쓸 수 있는 AI — 성능이 조금 약하고 하루 요청 수에 한도가 있다 */
export const FREE_AI_PROVIDERS: IAiProviderMeta[] = [
  {
    provider: "openrouter",
    name: "OpenRouter",
    badge: "가장 간단",
    description: "키를 복사할 필요 없이 브라우저에서 로그인만 하면 연결돼요.",
    method: "browser",
    notes: [
      "가입 또는 로그인 후 '허용'을 누르면 이 화면으로 자동으로 돌아와요.",
      "무료 모델은 하루 요청 수에 한도가 있어요.",
    ],
  },
  {
    provider: "gemini",
    name: "Google Gemini",
    description: "Google AI Studio에서 무료 키를 만들어 붙여넣으면 연결돼요.",
    method: "apiKey",
    keyIssueUrl: "https://aistudio.google.com/apikey",
    keyIssueLabel: "키 만들기",
    keyPlaceholder: "Gemini 키를 붙여넣으세요",
    notes: [
      "만 18세 이상만 사용할 수 있어요.",
      "결제가 연결된 Google 프로젝트에서 만든 키는 요금이 나갈 수 있어요. 결제를 연결하지 않은 프로젝트에서 키를 만드세요.",
    ],
  },
];

/** 사용한 만큼 요금이 나가는 AI — ChatGPT Plus·Claude Pro 같은 월 구독과는 별개로 과금된다 */
export const PAID_AI_PROVIDERS: IAiProviderMeta[] = [
  {
    provider: "openai",
    name: "OpenAI (ChatGPT)",
    description: "OpenAI 플랫폼에서 발급한 API 키로 연결해요.",
    method: "apiKey",
    keyIssueUrl: "https://platform.openai.com/api-keys",
    keyIssueLabel: "키 발급받기",
    keyPlaceholder: "sk-로 시작하는 키를 붙여넣으세요",
    notes: [
      "ChatGPT Plus 구독과는 별개로, 사용한 만큼 OpenAI 계정에서 요금이 나가요.",
      "OpenAI 플랫폼에서 월 사용 한도를 정해두면 예상치 못한 요금을 막을 수 있어요.",
    ],
  },
  {
    provider: "anthropic",
    name: "Anthropic (Claude)",
    description: "Claude 콘솔에서 발급한 API 키로 연결해요.",
    method: "apiKey",
    keyIssueUrl: "https://console.anthropic.com/settings/keys",
    keyIssueLabel: "키 발급받기",
    keyPlaceholder: "sk-ant-로 시작하는 키를 붙여넣으세요",
    notes: [
      "Claude Pro·Max 구독과는 별개로, 사용한 만큼 Anthropic 계정에서 요금이 나가요.",
      "콘솔에서 크레딧을 충전해야 키가 동작해요.",
    ],
  },
];

export const AI_PROVIDER_NAME: Record<TAiProvider, string> = Object.fromEntries(
  [...FREE_AI_PROVIDERS, ...PAID_AI_PROVIDERS].map((p) => [p.provider, p.name])
) as Record<TAiProvider, string>;
