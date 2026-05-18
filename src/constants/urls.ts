/**
 * URL 상수
 * 사이트 URL과 API URL을 중앙에서 관리합니다.
 */

const DEFAULT_SITE_URL = "https://www.qknou.kr";
const DEFAULT_API_URL = "https://api.qknou.kr";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? DEFAULT_SITE_URL;

/**
 * OAuth 등 전체 페이지 이동 — API 도메인으로 직접 이동
 */
export const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? DEFAULT_API_URL;

function resolveServerApiUrl() {
  return (
    process.env.API_PROXY_TARGET?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
    DEFAULT_API_URL
  );
}

/**
 * fetch/XHR용 API 베이스
 * - 브라우저(프로덕션): same-origin `/api-proxy` → CORS 회피
 * - 서버(SSR/빌드): API 도메인 직접 호출 (서버 간 통신, CORS 없음)
 * - NEXT_PUBLIC_API_URL 설정 시 항상 해당 URL 사용
 */
export const API_URL = (() => {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.NODE_ENV === "production") {
    if (typeof window !== "undefined") return "/api-proxy";
    return resolveServerApiUrl();
  }

  return DEFAULT_API_URL;
})();
