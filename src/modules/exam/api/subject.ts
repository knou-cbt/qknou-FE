import { SubjectApiPaths } from "@/shared/config";

import type {
  ISubject,
  IExam,
  IGetSubjectListParams,
  IGetSubjectListResponse,
} from "../lib";

/** API 응답 공통 형식 */
interface IApiResponse<T> {
  success: boolean;
  data: T;
}

/** 과목 목록 조회 */
export const getSubjectList = async (
  params?: IGetSubjectListParams
): Promise<IGetSubjectListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const url = searchParams.toString()
    ? `${SubjectApiPaths.list}?${searchParams.toString()}`
    : SubjectApiPaths.list;

  const response = await fetch(url);
  if (!response.ok) throw new Error("과목 목록 조회 실패");

  const result: IApiResponse<IGetSubjectListResponse> = await response.json();
  return result.data;
};

/** 과목 상세 조회 */
export const getSubjectDetail = async (id: string): Promise<ISubject> => {
  const response = await fetch(SubjectApiPaths.detail(id));

  if (!response.ok) throw new Error("과목 정보 조회 실패");

  const result: IApiResponse<ISubject> = await response.json();
  return result.data;
};

/** 특정 과목의 시험지 목록 조회 */
export const getExamListBySubject = async (
  subjectId: string
): Promise<IExam[]> => {
  const response = await fetch(SubjectApiPaths.exams(subjectId));
  if (!response.ok) throw new Error("시험지 목록 조회 실패");

  const result: IApiResponse<IExam[]> = await response.json();
  return result.data;
};
