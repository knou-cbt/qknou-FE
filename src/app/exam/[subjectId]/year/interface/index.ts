// Exam Year 관련 인터페이스 정의

/** 과목 정보 */
export interface ISubject {
  id: number;
  name: string;
  examCount?: number;
  createdAt?: string;
}

/** 시험지 정보 */
export interface IExam {
  id: string;
  year: number;
  title?: string;
  subjectId: string;
  subjectName?: string;
}

/** @deprecated IExam으로 대체 */
export interface IExamYear {
  id: string;
  year: number;
  subjectId: string;
}
