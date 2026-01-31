import { MetadataRoute } from "next";
import { SubjectApiPaths, SITE_URL } from "@/constants";

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

  // 기본 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // 동적 페이지들 생성
  const dynamicPages: MetadataRoute.Sitemap = [];

  try {
    // 모든 과목 조회
    const subjects = await getAllSubjects();

    for (const subject of subjects) {
      // 과목별 연도 선택 페이지
      dynamicPages.push({
        url: `${baseUrl}/exam/${subject.id}/year`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });

      // 각 과목의 시험지 목록 조회
      const exams = await getExamsBySubject(subject.id);

      for (const exam of exams) {
        // 암기 모드 페이지 (subject.id 사용 - 이미 해당 과목의 시험지이므로)
        dynamicPages.push({
          url: `${baseUrl}/exam/${subject.id}/${exam.id}/memorize-mode`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });

        // 테스트 모드 페이지 (subject.id 사용 - 이미 해당 과목의 시험지이므로)
        dynamicPages.push({
          url: `${baseUrl}/exam/${subject.id}/${exam.id}/test-mode`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("사이트맵 생성 중 오류:", error);
  }

  return [...staticPages, ...dynamicPages];
}
