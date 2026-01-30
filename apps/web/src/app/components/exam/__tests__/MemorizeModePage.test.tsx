/**
 * 암기 모드(MemorizeModePage) 단위 테스트
 * - GWT(Given-When-Then) 구조, 비즈니스 행위 중심 명세
 * - 검증은 사용자가 보는 결과(화면·상태) 위주
 */

import React from "react";
import {
  givenExamIsLoading,
  givenExamHasError,
  givenExamDataIsReady,
  renderMemorizeModePage,
  whenUserClicksAnswer,
  whenUserClicksShowAnswer,
  whenUserClicksPrev,
  whenUserClicksNext,
  whenUserClicksReset,
  thenUserSeesLoadingMessage,
  thenUserSeesErrorMessage,
  thenUserSeesExplanation,
  thenUserDoesNotSeeExplanation,
  thenAnswerAppearsSelected,
  thenAnswerAppearsUnselected,
  thenShowAnswerButtonIsDisabled,
  thenUserSeesBreadcrumbWithSubjectAndYear,
} from "./fixtures/exam-test-fixture";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/shared/lib", () => ({
  useIsMobile: () => false,
}));

jest.mock("@/modules/exam", () => require("../__mocks__/exam"));

describe("암기 모드 (MemorizeModePage)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    givenExamDataIsReady();
  });

  test("문제를 불러오는 동안에는 사용자에게 로딩 안내 문구가 보인다", () => {
    // Given: 시험 문제를 불러오는 중인 상태
    givenExamIsLoading();

    // When: 암기 모드 화면을 연다
    renderMemorizeModePage({ yearId: "2023" });

    // Then: "문제를 불러오는 중" 문구가 보인다
    thenUserSeesLoadingMessage();
  });

  test("문제를 불러오는데 실패하면 사용자에게 에러 안내가 보인다", () => {
    // Given: 시험 문제 로드에 실패한 상태
    givenExamHasError();

    // When: 암기 모드 화면을 연다
    renderMemorizeModePage({ yearId: "2023" });

    // Then: "문제를 불러오는데 실패했습니다" 문구가 보인다
    thenUserSeesErrorMessage();
  });

  test("사용자가 답안을 선택하면 해당 보기가 선택된 것처럼 보인다", () => {
    // Given: 시험 데이터가 준비된 상태
    // When: 암기 모드 화면을 열고 첫 번째 보기를 선택한다
    renderMemorizeModePage({ yearId: "2023" });
    whenUserClicksAnswer(1);

    // Then: 해당 보기에 선택 상태가 반영되어 보인다
    thenAnswerAppearsSelected(1);
  });

  test("사용자가 답을 선택한 뒤 정답 보기를 누르면 해설이 보인다", () => {
    // Given: 시험 데이터가 준비된 상태
    renderMemorizeModePage({ yearId: "2023" });

    // When: 첫 번째 보기를 선택하고 "정답 보기"를 누른다
    whenUserClicksAnswer(1);
    whenUserClicksShowAnswer();

    // Then: "해설" 영역이 보인다
    thenUserSeesExplanation();
  });

  test("다음 문제로 갔다가 이전으로 돌아오면 해당 문제의 정답 보기 상태와 해설이 그대로 복원되어 보인다", () => {
    // Given: 시험 데이터가 준비된 상태
    renderMemorizeModePage({ yearId: "2023" });

    // When: 두 번째 보기를 선택하고 정답 보기를 누른 뒤, 다음 → 이전으로 이동한다
    whenUserClicksAnswer(2);
    whenUserClicksShowAnswer();
    whenUserClicksNext();
    whenUserClicksPrev();

    // Then: 다시 첫 문제에 있으며 해설이 보이고, 정답 보기 버튼은 비활성화되어 있다
    thenUserSeesExplanation();
    thenShowAnswerButtonIsDisabled();
  });

  test("사용자가 문제 다시 풀기를 누르면 선택과 해설이 사라지고 처음 상태로 돌아간 것처럼 보인다", () => {
    // Given: 시험 데이터가 준비된 상태
    renderMemorizeModePage({ yearId: "2023" });

    // When: 첫 번째 보기를 선택하고 정답 보기를 누른 뒤 "문제 다시 풀기"를 누른다
    whenUserClicksAnswer(1);
    whenUserClicksShowAnswer();
    whenUserClicksReset();

    // Then: 해당 보기는 선택 해제된 것처럼 보이고 해설은 보이지 않는다
    thenAnswerAppearsUnselected(1);
    thenUserDoesNotSeeExplanation();
  });

  test("화면 상단 Breadcrumb에 과목명과 연도가 올바르게 보인다", () => {
    // Given: 시험 데이터가 준비된 상태 (mock: 수학, 2023)
    // When: 암기 모드 화면을 연다
    renderMemorizeModePage({ subjectId: "1", yearId: "2023" });

    // Then: Breadcrumb에 "수학", "2023"이 보인다
    thenUserSeesBreadcrumbWithSubjectAndYear("수학", "2023");
  });
});
