/**
 * URL 상수
 * 사이트 URL과 API URL을 중앙에서 관리합니다.
 */

const DEFAULT_SITE_URL = "https://www.qknou.kr";
export const DEFAULT_API_URL = "https://qknou-be.onrender.com";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? DEFAULT_SITE_URL;

/**
 * OAuth 등 전체 페이지 이동 — API 도메인으로 직접 이동
 */
export const API_AUTH_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? DEFAULT_API_URL;

function resolveServerApiUrl() {
  return process.env.API_PROXY_TARGET?.replace(/\/$/, "") ?? DEFAULT_API_URL;
}

/**
 * 기존(v1) API 베이스 — 과목/시험/튜터 등 이전부터 쓰던 API.
 * NEXT_PUBLIC_API_URL의 영향을 받지 않고 기존 라우팅을 그대로 유지한다.
 * - 브라우저(프로덕션): same-origin `/api-proxy` → CORS 회피
 * - 서버(SSR/빌드): API 도메인 직접 호출 (서버 간 통신, CORS 없음)
 * - 그 외(로컬 개발): DEFAULT_API_URL 직접 호출
 */
export const API_URL = (() => {
  if (process.env.NODE_ENV === "production") {
    if (typeof window !== "undefined") return "/api-proxy";
    return resolveServerApiUrl();
  }

  return DEFAULT_API_URL;
})();

/**
 * 신규(v2) API 베이스 — 피드백/공지/북마크/마이페이지/문항공유/시험지등록 등
 * FE-V2에서 새로 추가된 API 전용. 로컬에서 NEXT_PUBLIC_API_URL로 별도
 * dev 백엔드를 지정하면 이 API들만(로그인 포함) 그 주소를 사용한다.
 */
export const NEW_API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? API_URL;
