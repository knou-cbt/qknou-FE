/** API 응답 공통 형식 */
export interface IApiResponse<T> {
  success: boolean;
  data: T;
}

// ============================================
// Subject 관련 공통 타입
// ============================================

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

/** 과목 목록 조회 파라미터 */
export interface IGetSubjectListParams {
  search?: string;
  page?: number;
  limit?: number;
}

/** 페이지네이션 정보 */
export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 과목 목록 조회 응답 */
export interface IGetSubjectListResponse {
  pagination: IPagination;
  subjects: ISubject[];
}
