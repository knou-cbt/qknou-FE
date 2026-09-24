import { SuccessContent } from "./components/SuccessContent";

// 이 페이지는 항상 쿼리스트링(token)에 의존하므로 정적 프리렌더링 대상에서
// 제외하고 매 요청마다 서버 렌더링한다 (Suspense fallback에 멈춰있던 문제 방지).
export const dynamic = "force-dynamic";

export default function Page() {
  return <SuccessContent />;
}
