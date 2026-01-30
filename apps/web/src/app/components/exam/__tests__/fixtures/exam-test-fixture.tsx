/**
 * 시험/암기 모드 테스트용 픽스처 (DAMP: Descriptive And Meaningful Phrases)
 * - 준비/실행/검증 헬퍼를 한 곳에 두어 중복을 줄이되, 각 테스트는 독립·격리 유지
 * - 검증은 "구현"이 아닌 "사용자가 보는 결과" 위주로 사용
 */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TestModePage } from "../../TestModePage";
import { MemorizeModePage } from "../../MemorizeModePage";

// ---------------------------------------------------------------------------
// 상수: 화면에 나타나는 문구 (한 곳에서 관리)
// ---------------------------------------------------------------------------

export const UI_MESSAGES = {
  LOADING: "문제를 불러오는 중",
  ERROR: "문제를 불러오는데 실패했습니다",
  INVALID_EXAM: "시험 정보가 올바르지 않습니다",
  RESULT_TITLE: "시험 결과",
  RESULT_SCORE: "획득 점수",
  EXPLANATION: "해설",
} as const;

// ---------------------------------------------------------------------------
// Given: 시험 데이터/상태 준비 (mock 설정만, 렌더 없음)
// ---------------------------------------------------------------------------

function getExamMock() {
  return require("../../__mocks__/exam");
}

/** Given: 시험 문제를 불러오는 중인 상태 */
export function givenExamIsLoading() {
  const { useExamQuestionsQuery, useExamQuestionsWithAnswersQuery } = getExamMock();
  const loading = { data: undefined, isLoading: true, isError: false };
  useExamQuestionsQuery?.mockReturnValue(loading);
  useExamQuestionsWithAnswersQuery?.mockReturnValue(loading);
}

/** Given: 시험 문제 로드에 실패한 상태 */
export function givenExamHasError() {
  const { useExamQuestionsQuery, useExamQuestionsWithAnswersQuery } = getExamMock();
  const error = { data: undefined, isLoading: false, isError: true };
  useExamQuestionsQuery?.mockReturnValue(error);
  useExamQuestionsWithAnswersQuery?.mockReturnValue(error);
}

/** Given: 시험 정보가 없거나 문제 목록이 비어 있는 상태 */
export function givenExamIsEmptyOrInvalid() {
  const { useExamQuestionsQuery, useExamQuestionsWithAnswersQuery } = getExamMock();
  const empty = { data: undefined, isLoading: false, isError: false };
  useExamQuestionsQuery?.mockReturnValue(empty);
  useExamQuestionsWithAnswersQuery?.mockReturnValue(empty);
}

/** Given: 문제 목록만 비어 있고 exam 객체는 있는 상태 */
export function givenExamHasNoQuestions() {
  const { useExamQuestionsQuery, useExamQuestionsWithAnswersQuery } = getExamMock();
  const noQuestions = { data: { exam: {}, questions: [] }, isLoading: false, isError: false };
  useExamQuestionsQuery?.mockReturnValue(noQuestions);
  useExamQuestionsWithAnswersQuery?.mockReturnValue(noQuestions);
}

/** Given: 시험 데이터가 정상적으로 준비된 상태 (기본값) */
export function givenExamDataIsReady() {
  const exam = getExamMock();
  const { mockExamData } = exam;
  const ready = { data: mockExamData, isLoading: false, isError: false };
  exam.useExamQuestionsQuery?.mockReturnValue(ready);
  exam.useExamQuestionsWithAnswersQuery?.mockReturnValue(ready);
}

/** Given: 시험 모드용 Context·제출 mock (시험 종료 트리거 저장) */
export function givenTestModeMocksAllowExamEnd() {
  const exam = getExamMock();
  const setOnExamEnd = (fn: () => void) => {
    (window as unknown as { __onExamEnd?: () => void }).__onExamEnd = fn;
  };
  exam.useExamContext?.mockReturnValue({
    setOnExamEnd,
    setUnansweredCount: jest.fn(),
    setTotalQuestions: jest.fn(),
    setIsSubmitted: jest.fn(),
  });
  exam.useExamSubmitMutation?.mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue({
      results: [
        { questionId: 1, isCorrect: true, selectedAnswer: 2, correctAnswers: [2] },
        { questionId: 2, isCorrect: false, selectedAnswer: 1, correctAnswers: [2] },
      ],
    }),
  });
}

// ---------------------------------------------------------------------------
// When: 사용자 행동 시뮬레이션
// ---------------------------------------------------------------------------

/** When: 사용자가 특정 답안을 선택한다 */
export function whenUserClicksAnswer(value: string | number) {
  fireEvent.click(screen.getByTestId(`answer-${value}`));
}

/** When: 사용자가 "이전" 버튼을 누른다 */
export function whenUserClicksPrev() {
  fireEvent.click(screen.getByTestId("prev-button"));
}

/** When: 사용자가 "다음" 버튼을 누른다 */
export function whenUserClicksNext() {
  fireEvent.click(screen.getByTestId("next-button"));
}

/** When: 사용자가 "정답 보기" 또는 "정답 확인" 버튼을 누른다 (시험 모드/암기 모드 공통) */
export function whenUserClicksShowAnswer() {
  fireEvent.click(screen.getByRole("button", { name: /정답 (보기|확인)/ }));
}

/** When: 사용자가 "문제 다시 풀기" 버튼을 누른다 */
export function whenUserClicksReset() {
  const resetButtons = screen.getAllByTestId("reset-button");
  fireEvent.click(resetButtons[0]);
}

/** When: 사용자가 시험 종료(제출)를 트리거한다 */
export async function whenUserEndsExam() {
  const onExamEnd = (window as unknown as { __onExamEnd?: () => void }).__onExamEnd;
  if (onExamEnd) {
    await act(async () => {
      await onExamEnd();
    });
  }
}

// ---------------------------------------------------------------------------
// Then: 사용자가 보는 결과 검증 (화면·상태)
// ---------------------------------------------------------------------------

/** Then: 로딩 안내 문구가 보인다 */
export function thenUserSeesLoadingMessage() {
  expect(screen.getByText(new RegExp(UI_MESSAGES.LOADING))).toBeInTheDocument();
}

/** Then: 에러 안내 문구가 보인다 */
export function thenUserSeesErrorMessage() {
  expect(screen.getByText(new RegExp(UI_MESSAGES.ERROR))).toBeInTheDocument();
}

/** Then: 시험 정보가 올바르지 않다는 안내가 보인다 */
export function thenUserSeesInvalidExamMessage() {
  expect(screen.getByText(new RegExp(UI_MESSAGES.INVALID_EXAM))).toBeInTheDocument();
}

/** Then: 시험 결과 화면(제목·획득 점수)이 보인다 */
export function thenUserSeesResultScreen() {
  expect(screen.getByText(new RegExp(UI_MESSAGES.RESULT_TITLE))).toBeInTheDocument();
  expect(screen.getByText(new RegExp(UI_MESSAGES.RESULT_SCORE))).toBeInTheDocument();
}

/** Then: 해설 영역이 보인다 */
export function thenUserSeesExplanation() {
  expect(screen.getByText(new RegExp(UI_MESSAGES.EXPLANATION))).toBeInTheDocument();
}

/** Then: 해설이 보이지 않는다 */
export function thenUserDoesNotSeeExplanation() {
  expect(screen.queryByText(new RegExp(UI_MESSAGES.EXPLANATION))).not.toBeInTheDocument();
}

/** Then: 해당 답안이 선택된 상태로 보인다 (aria-checked) */
export function thenAnswerAppearsSelected(value: string | number) {
  expect(screen.getByTestId(`answer-${value}`)).toHaveAttribute("aria-checked", "true");
}

/** Then: 해당 답안이 선택 해제된 상태로 보인다 */
export function thenAnswerAppearsUnselected(value: string | number) {
  expect(screen.getByTestId(`answer-${value}`)).toHaveAttribute("aria-checked", "false");
}

/** Then: "이전" 버튼이 비활성화되어 있다 */
export function thenPrevButtonIsDisabled() {
  expect(screen.getByTestId("prev-button")).toBeDisabled();
}

/** Then: "이전" 버튼이 활성화되어 있다 */
export function thenPrevButtonIsEnabled() {
  expect(screen.getByTestId("prev-button")).not.toBeDisabled();
}

/** Then: "다음" 버튼이 비활성화되어 있다 */
export function thenNextButtonIsDisabled() {
  expect(screen.getByTestId("next-button")).toBeDisabled();
}

/** Then: 정답 보기/확인 버튼이 비활성화되어 있다 */
export function thenShowAnswerButtonIsDisabled() {
  expect(screen.getByTestId("answer-button")).toBeDisabled();
}

/** Then: Breadcrumb에 과목명·연도가 보인다 */
export function thenUserSeesBreadcrumbWithSubjectAndYear(subject: string, year: string) {
  expect(screen.getByText(new RegExp(subject))).toBeInTheDocument();
  expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
}

// ---------------------------------------------------------------------------
// 렌더 헬퍼 (When: 화면을 연다)
// ---------------------------------------------------------------------------

/** 시험 모드 화면을 렌더한다 */
export function renderTestModePage(options: { yearId?: string } = {}) {
  return render(<TestModePage yearId={options.yearId} />);
}

/** 암기 모드 화면을 렌더한다 */
export function renderMemorizeModePage(options: { subjectId?: string; yearId?: string } = {}) {
  return render(
    <MemorizeModePage subjectId={options.subjectId} yearId={options.yearId} />
  );
}
