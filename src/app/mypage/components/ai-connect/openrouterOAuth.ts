/**
 * OpenRouter PKCE 로그인 (https://openrouter.ai/docs/use-cases/oauth-pkce)
 * 1. code_verifier를 만들어 sessionStorage에 두고, 그 SHA-256 해시(code_challenge)와 함께 OpenRouter로 이동
 * 2. 사용자가 허용하면 callback_url?code=... 로 돌아온다
 * 3. code + code_verifier로 OpenRouter에서 API 키를 받아 우리 서버에 저장한다
 */
const OPENROUTER_AUTH_URL = "https://openrouter.ai/auth";
const OPENROUTER_KEY_EXCHANGE_URL = "https://openrouter.ai/api/v1/auth/keys";
const CODE_VERIFIER_KEY = "qknou:openrouterCodeVerifier";

function base64UrlEncode(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

/** OpenRouter 로그인 화면으로 이동. 돌아올 주소는 지금 보고 있는 AI 연결 탭 */
export async function startOpenRouterLogin(callbackUrl: string) {
  const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
  sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);

  const challenge = await createCodeChallenge(verifier);
  const params = new URLSearchParams({
    callback_url: callbackUrl,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  window.location.href = `${OPENROUTER_AUTH_URL}?${params}`;
}

/** 이 탭에서 시작한 OpenRouter 로그인에서 돌아온 상태인지 */
export function hasPendingOpenRouterLogin(): boolean {
  try {
    return sessionStorage.getItem(CODE_VERIFIER_KEY) !== null;
  } catch {
    return false;
  }
}

/** 돌아온 code를 API 키로 교환. verifier는 한 번 쓰면 버린다 */
export async function exchangeOpenRouterCode(code: string): Promise<string> {
  const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
  sessionStorage.removeItem(CODE_VERIFIER_KEY);
  if (!verifier) throw new Error("missing code verifier");

  const res = await fetch(OPENROUTER_KEY_EXCHANGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      code_verifier: verifier,
      code_challenge_method: "S256",
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter key exchange failed: ${res.status}`);

  const { key } = (await res.json()) as { key?: string };
  if (!key) throw new Error("OpenRouter key exchange returned no key");
  return key;
}
