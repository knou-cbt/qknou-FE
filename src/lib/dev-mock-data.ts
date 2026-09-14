import type { IBookmarkItem } from "@/components/bookmark/interface";

/**
 * 개발 전용 목업 데이터.
 * 로컬에서 테스트 로그인(가짜 토큰) 사용 시 실제 백엔드가 401을 반환해
 * 북마크/풀이내역이 항상 비어있는 문제를 우회해, UI를 데이터가 찬 상태로 미리 볼 수 있게 한다.
 * NODE_ENV === "development"에서만 사용하며, 실 데이터가 있으면 그쪽이 항상 우선한다.
 */

const MOCK_SUBJECTS = [
  "데이터베이스",
  "네트워크",
  "운영체제",
  "자료구조",
  "알고리즘",
  "웹프로그래밍",
  "컴퓨터구조",
  "소프트웨어공학",
];

const MOCK_QUESTION_TEXTS = [
  "다음 중 관계형 데이터베이스의 특징으로 옳은 것은?",
  "TCP와 UDP의 차이점으로 옳지 않은 것은?",
  "프로세스와 스레드의 차이를 가장 올바르게 설명한 것은?",
  "다음 중 스택(Stack) 자료구조의 특성에 해당하는 것은?",
  "이진 탐색 트리의 평균 시간복잡도로 옳은 것은?",
  "HTTP와 HTTPS의 차이점을 보안 측면에서 서술하시오.",
  "CPU 스케줄링 알고리즘 중 선점형에 해당하지 않는 것은?",
  "정규화의 목적으로 가장 거리가 먼 것은?",
];

const EXAM_TYPES = ["중간고사", "기말고사"];

function seededDate(offsetDays: number): string {
  const base = new Date("2026-09-01T09:00:00Z");
  base.setDate(base.getDate() - offsetDays);
  return base.toISOString();
}

export const DEV_MOCK_BOOKMARKS: IBookmarkItem[] = Array.from(
  { length: 20 },
  (_, i) => {
    const subject = MOCK_SUBJECTS[i % MOCK_SUBJECTS.length];
    const examType = EXAM_TYPES[i % EXAM_TYPES.length];
    const year = 2020 + (i % 6);
    return {
      questionId: 1000 + i,
      questionNumber: (i % 20) + 1,
      questionText: MOCK_QUESTION_TEXTS[i % MOCK_QUESTION_TEXTS.length],
      examId: 200 + (i % MOCK_SUBJECTS.length),
      examTitle: `${year}년 ${examType}`,
      subjectName: subject,
      bookmarkedAt: seededDate(i * 2),
    };
  }
);

export interface IMockExamHistoryCard {
  id: number;
  subjectName: string;
  year: number;
  examType: string;
  submittedAt: string;
  correctCount: number;
  totalQuestions: number;
}

export const DEV_MOCK_EXAM_HISTORY_CARDS: IMockExamHistoryCard[] = Array.from(
  { length: 20 },
  (_, i) => {
    const subject = MOCK_SUBJECTS[i % MOCK_SUBJECTS.length];
    const examType = EXAM_TYPES[i % EXAM_TYPES.length];
    const totalQuestions = 20;
    const correctCount = 10 + ((i * 3) % 11); // 10~20 사이 변동
    return {
      id: 300 + i,
      subjectName: subject,
      year: 2020 + (i % 6),
      examType,
      submittedAt: seededDate(i),
      correctCount,
      totalQuestions,
    };
  }
);
