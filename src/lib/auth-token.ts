/**
 * 인증 토큰 접근 유틸
 * localStorage 접근 지점을 단일화한다.
 */

export const TOKEN_KEY = "qknou_auth_token";

/** 로그인 후 복귀할 경로를 저장하는 sessionStorage 키 */
export const POST_LOGIN_REDIRECT_KEY = "qknou_post_login_redirect";

/** 브라우저 localStorage에서 access token 읽기 (없으면 null) */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
