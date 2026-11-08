import type { Metadata } from "next";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { ExamQueryKeys, SubjectApiPaths } from "@/constants";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { MemorizeModePage } from "./components";
import { getExamQuestionsWithAnswers } from "./hooks/api";

type PageProps = {
  params: Promise<{ subjectId: string; yearId: string }>;
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

async function getExamYear(
  subjectId: string,
  yearId: string
): Promise<number | null> {
  try {
    const res = await fetch(SubjectApiPaths.exams(subjectId), {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json: IApiResponse<{ id: number | string; year: number }[]> = await res.json();
    // API는 id를 숫자로 내려주므로 URL의 문자열 yearId와 문자열끼리 비교
    const exam = json.data?.find((e) => String(e.id) === yearId);
    return exam?.year ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subjectId, yearId } = await params;
  const [subjectName, year] = await Promise.all([
    getSubjectName(subjectId),
    getExamYear(subjectId, yearId),
  ]);
  const title =
    subjectName != null && year != null
      ? `${subjectName} ${year}년 기출 암기모드`
      : "기출 암기모드";
  const description =
    subjectName != null && year != null
      ? `${subjectName} ${year}년 기출문제 암기모드. 방송통신대학교 기출문제를 한곳에서 풀어보세요.`
      : "방송통신대학교 기출문제 암기모드. 큐노에서 기출문제를 풀어보세요.";

  return {
    title,
    description,
    alternates: {
      canonical: `/exam/${subjectId}/${yearId}/memorize-mode`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { subjectId, yearId } = await params;

  // 문항을 서버에서 미리 조회해 HTML에 포함 (크롤러가 "불러오는 중"만 보지 않도록)
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ExamQueryKeys.questions(yearId, "study"),
    queryFn: () =>
      getExamQuestionsWithAnswers(yearId, { next: { revalidate: 3600 } }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdSenseScript />
      <MemorizeModePage subjectId={subjectId} yearId={yearId} />
    </HydrationBoundary>
  );
}
