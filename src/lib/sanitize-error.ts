/**
 * 백엔드/외부 API가 내려준 에러 문구에 내부 인프라 정보(내부 LLM 서버 주소·IP·포트 등)가
 * 섞여 있으면 브라우저로 내보내지 않는다.
 * 예) "Connection error: http://10.0.0.1:11300/v1" → 기본 안내 문구로 교체
 */

const URL_PATTERN = /\b(?:https?|wss?|tcp):\/\/\S+/i;
const IPV4_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
const HOST_PORT_PATTERN = /\b(?:localhost|[\w-]+(?:\.[\w-]+)+):\d{2,5}\b/i;

/** 에러 응답에서 사람이 읽는 문구가 담기는 필드들 */
const MESSAGE_FIELDS = ["error", "message", "detail", "details", "reason", "stack", "cause"] as const;

export function containsInfraDetail(text: string): boolean {
  return URL_PATTERN.test(text) || IPV4_PATTERN.test(text) || HOST_PORT_PATTERN.test(text);
}

/** 내부 정보가 보이면 문구 전체를 fallback으로 바꾼다 (일부만 지우면 문장이 깨지므로) */
export function sanitizeErrorText(text: string, fallback: string): string {
  return containsInfraDetail(text) ? fallback : text;
}

function sanitizeValue(value: unknown, fallback: string): unknown {
  if (typeof value === "string") return sanitizeErrorText(value, fallback);
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, fallback));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeValue(item, fallback)]),
    );
  }
  return value;
}

/**
 * 에러 응답 JSON의 메시지 필드(error/message/detail…)를 정리한다.
 * code·remainingCount 같은 다른 필드는 그대로 둔다.
 */
export function sanitizeErrorPayload<T>(payload: T, fallback: string): T {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  const result: Record<string, unknown> = { ...(payload as Record<string, unknown>) };
  for (const field of MESSAGE_FIELDS) {
    if (field in result) result[field] = sanitizeValue(result[field], fallback);
  }
  return result as T;
}
