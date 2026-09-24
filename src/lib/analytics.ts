import { sendGAEvent } from "@next/third-parties/google";

/**
 * GA4로 커스텀 이벤트를 보낸다. layout.tsx의 <GoogleAnalytics gaId=... />가
 * 마운트되기 전(또는 광고 차단 등으로 스크립트가 아예 안 뜬 환경)에 호출되면
 * sendGAEvent 내부에서 console.warn만 하고 조용히 무시된다.
 */
export function trackEvent(
  name: string,
  params: Record<string, string | number | boolean> = {}
) {
  sendGAEvent("event", name, params);
}
