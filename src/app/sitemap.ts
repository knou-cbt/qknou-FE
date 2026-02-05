import { MetadataRoute } from "next";
import { SubjectApiPaths, SITE_URL } from "@/constants";

/** 요청 시마다 사이트맵 생성 — 잘못 캐시돼서 HTML이 나가는 상황 방지 */
export const dynamic = "force-dynamic";

interface IApiResponse<T> {
  success: boolean;
  data: T;
}

interface ISubject {
  id: number;
  name: string;
}

interface IExam {
  id: string;
  year: number;
  subjectId?: string; // API 응답에 없을 수 있으므로 optional로 변경
}

/** 모든 과목 목록 조회 (페이지네이션 없이) */
async function getAllSubjects(): Promise<ISubject[]> {
  try {
    const response = await fetch(`${SubjectApiPaths.list}?limit=1000`, {
      next: { revalidate: 3600 }, // 1시간마다 재검증
    });

    if (!response.ok) {
      console.error("과목 목록 조회 실패");
      return [];
    }

    const result: IApiResponse<{
      pagination: { total: number };
      subjects: ISubject[];
    }> = await response.json();

    return result.data?.subjects ?? [];
  } catch (error) {
    console.error("사이트맵 생성 중 과목 목록 조회 오류:", error);
    return [];
  }
}

/** 특정 과목의 시험지 목록 조회 */
async function getExamsBySubject(subjectId: number): Promise<IExam[]> {
  try {
    const response = await fetch(SubjectApiPaths.exams(subjectId), {
      next: { revalidate: 3600 }, // 1시간마다 재검증
    });

    if (!response.ok) {
      return [];
    }

    const result: IApiResponse<IExam[]> = await response.json();
    return result.data ?? [];
  } catch (error) {
    console.error(`과목 ${subjectId}의 시험지 목록 조회 오류:`, error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // 기본 페이지들 — 에러 시에도 최소한 이 목록은 반환해 XML이 나가도록
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    const dynamicPages: MetadataRoute.Sitemap = [];
    const subjects = await getAllSubjects();

    for (const subject of subjects) {
      dynamicPages.push({
        url: `${baseUrl}/exam/${subject.id}/year`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });

      const exams = await getExamsBySubject(subject.id);
      for (const exam of exams) {
        dynamicPages.push({
          url: `${baseUrl}/exam/${subject.id}/${exam.id}/memorize-mode`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
        dynamicPages.push({
          url: `${baseUrl}/exam/${subject.id}/${exam.id}/test-mode`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }

    return [...staticPages, ...dynamicPages];
  } catch (error) {
    console.error("사이트맵 생성 중 오류:", error);
    // 에러 시에도 최소한 메인 URL만 담은 사이트맵 반환 → HTML 에러 페이지 대신 XML 유지
    return staticPages;
  }
}
