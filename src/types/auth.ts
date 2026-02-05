/**
 * 인증 관련 타입 정의
 */

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
  provider?: "google" | "kakao";
  profileImage?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface DecodedToken {
  sub?: string; // 사용자 ID (백엔드에서 sub로 반환)
  id?: string;
  email?: string | null;
  name?: string | null;
  nickname?: string | null; // 카카오 닉네임
  provider?: "google" | "kakao";
  profileImage?: string;
  iat?: number;
  exp?: number;
}
