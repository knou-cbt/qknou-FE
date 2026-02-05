import type { Metadata } from "next";
import { SubjectApiPaths } from "@/constants";
import { ExamYearPage } from "./components";

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
  };
}

export default async function Page({ params }: PageProps) {
  const { subjectId } = await params;
  return <ExamYearPage subjectId={subjectId} />;
}
