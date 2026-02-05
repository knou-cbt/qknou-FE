import type { Metadata } from "next";
import { SubjectApiPaths } from "@/constants";
import { MemorizeModePage } from "./components";

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
    const json: IApiResponse<{ id: string; year: number }[]> = await res.json();
    const exam = json.data?.find((e) => e.id === yearId);
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
  };
}

export default async function Page({ params }: PageProps) {
  const { subjectId, yearId } = await params;

  return <MemorizeModePage subjectId={subjectId} yearId={yearId} />;
}
