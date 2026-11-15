import { containsInfraDetail, sanitizeErrorPayload, sanitizeErrorText } from "./sanitize-error";

const FALLBACK = "잠시 후 다시 시도해 주세요.";

describe("sanitize-error", () => {
  it("내부 LLM 서버 주소가 담긴 문구를 감지한다", () => {
    expect(containsInfraDetail("Connection error: http://222.107.52.227:11300/v1")).toBe(true);
    expect(containsInfraDetail("connect ECONNREFUSED 10.0.0.5:8080")).toBe(true);
    expect(containsInfraDetail("upstream llm.internal.local:11300 timeout")).toBe(true);
  });

  it("일반 안내 문구는 그대로 둔다", () => {
    const message = "오늘 사용 가능한 튜터 질문 5회를 모두 사용했어요.";
    expect(containsInfraDetail(message)).toBe(false);
    expect(sanitizeErrorText(message, FALLBACK)).toBe(message);
  });

  it("내부 정보가 있으면 문구 전체를 fallback으로 바꾼다", () => {
    expect(sanitizeErrorText("Failed to reach http://222.107.52.227:11300/v1", FALLBACK)).toBe(FALLBACK);
  });

  it("에러 payload의 메시지 필드만 정리하고 나머지 필드는 유지한다", () => {
    const payload = {
      success: false,
      code: "AI_PROVIDER_ERROR",
      remainingCount: 3,
      error: "APIConnectionError: http://222.107.52.227:11300/v1",
      detail: { message: "base_url=http://222.107.52.227:11300/v1" },
    };
    expect(sanitizeErrorPayload(payload, FALLBACK)).toEqual({
      success: false,
      code: "AI_PROVIDER_ERROR",
      remainingCount: 3,
      error: FALLBACK,
      detail: { message: FALLBACK },
    });
  });
});
