import type { Metadata } from "next";
import { SubjectApiPaths } from "@/constants";
import { TestModePage } from "./components";

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
      ? `${subjectName} ${year}년 기출 시험모드`
      : "기출 시험모드";
  const description =
    subjectName != null && year != null
      ? `${subjectName} ${year}년 기출문제 시험모드. 방송통신대학교 기출문제를 실전처럼 풀어보세요.`
      : "방송통신대학교 기출문제 시험모드. 큐노에서 실전 시험을 풀어보세요.";

  return {
    title,
    description,
    alternates: {
      canonical: `/exam/${subjectId}/${yearId}/test-mode`,
    },
    // 암기모드와 같은 문항에서 정답만 가린 페이지라 검색·광고 크롤러에는 중복 저품질 페이지로 보인다
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params }: PageProps) {
  const { subjectId, yearId } = await params;
  return <TestModePage subjectId={subjectId} yearId={yearId} />;
}
