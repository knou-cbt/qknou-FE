import type { Metadata } from "next";

import { ExamHistoryResultPage } from "./components/ExamHistoryResultPage";

type PageProps = {
  params: Promise<{ attemptId: string }>;
};

export const metadata: Metadata = {
  title: "시험 결과",
  robots: { index: false, follow: false },
};

// 로그인 상태에 의존하는 페이지라 정적 프리렌더링 대상에서 제외
export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps) {
  const { attemptId } = await params;
  return <ExamHistoryResultPage attemptId={attemptId} />;
}
