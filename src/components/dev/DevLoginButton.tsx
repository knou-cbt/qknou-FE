"use client";

import { useAuth } from "@/contexts";

function base64url(obj: object) {
  // btoa는 Latin1만 지원 — UTF-8 바이트로 변환 후 인코딩 (한글 payload 대응)
  const utf8 = new TextEncoder().encode(JSON.stringify(obj));
  const binary = Array.from(utf8, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * 서명 검증 없이 클라이언트에서만 디코딩되는 가짜 JWT.
 * 로컬 UI 확인용 — 실제 백엔드는 서명을 검증하므로 북마크/마이페이지 등
 * 인증이 필요한 API 호출은 401로 실패하고 자동 로그아웃될 수 있다.
 */
function buildFakeToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "none", typ: "JWT" };
  const payload = {
    sub: "dev-user",
    id: "dev-user",
    email: "dev@qknou.local",
    name: "테스트 유저",
    nickname: "테스트 유저",
    provider: "google" as const,
    iat: now,
    exp: now + 60 * 60 * 24 * 30,
  };
  return `${base64url(header)}.${base64url(payload)}.dev`;
}

/**
 * 개발 모드 전용: 실제 로그인 없이 인증 상태 UI를 확인하기 위한 버튼.
 * 렌더 여부는 부모(AppContent)에서 NODE_ENV로 분기한다 — 훅을 조건부로 호출하지 않기 위함.
 */
export const DevLoginButton = () => {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <button
      type="button"
      onClick={() => (isAuthenticated ? logout() : login(buildFakeToken()))}
      className="fixed bottom-4 left-4 z-[100] rounded-full border-2 border-dashed border-[#F59E0B] bg-[#FFFBEB] px-3 py-1.5 text-xs font-semibold text-[#92400E] shadow-md cursor-pointer"
    >
      {isAuthenticated ? "🧪 테스트 로그아웃" : "🧪 테스트 로그인"}
    </button>
  );
};
