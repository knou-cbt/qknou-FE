import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { SubjectApiPaths, SubjectQueryKeys } from "@/constants";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { ExamYearPage } from "./components";
import { getExamListBySubject, getSubjectDetail } from "./hooks/api";

type PageProps = {
  params: Promise<{ subjectId: string }>;
};

interface IApiResponse<T> {
  success: boolean;
  data: T;
}

async function getSubjectName(subjectId: string): Promise<string | null> {
  try {
    const res = await fetch(SubjectApiPaths.detail(subjectId), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json: IApiResponse<{ name: string }> = await res.json();
    return json.data?.name ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subjectId } = await params;
  const subjectName = await getSubjectName(subjectId);
  const title = subjectName ?? "과목";
  const description =
    subjectName != null
      ? `${subjectName} 기출문제 연도별 선택. 방송통신대학교 기출문제를 한곳에서 풀어보세요.`
      : "방송통신대학교 기출문제 연도별 선택. 큐노에서 과목별 기출문제를 풀어보세요.";

  return {
    title,
    description,
    alternates: {
      canonical: `/exam/${subjectId}/year`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { subjectId } = await params;

  // 과목명·시험 목록을 서버에서 미리 조회해 HTML에 포함 (크롤러가 "불러오는 중"만 보지 않도록)
  const queryClient = new QueryClient();
  const init = { next: { revalidate: 3600 } };
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: SubjectQueryKeys.detail(subjectId),
      queryFn: () => getSubjectDetail(subjectId, init),
    }),
    queryClient.prefetchQuery({
      queryKey: SubjectQueryKeys.exams(subjectId),
      queryFn: () => getExamListBySubject(subjectId, init),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdSenseScript />
      <ExamYearPage subjectId={subjectId} />
    </HydrationBoundary>
  );
}
