/**
 * 시험 모드(TestModePage) 단위 테스트
 * - GWT(Given-When-Then) 구조, 비즈니스 행위 중심 명세
 * - 검증은 사용자가 보는 결과(화면·상태) 위주
 */

import React from "react";
import {
  givenExamIsLoading,
  givenExamHasError,
  givenExamIsEmptyOrInvalid,
  givenExamHasNoQuestions,
  givenExamDataIsReady,
  givenTestModeMocksAllowExamEnd,
  renderTestModePage,
  whenUserClicksAnswer,
  whenUserClicksPrev,
  whenUserClicksNext,
  whenUserEndsExam,
  thenUserSeesLoadingMessage,
  thenUserSeesErrorMessage,
  thenUserSeesInvalidExamMessage,
  thenUserSeesResultScreen,
  thenAnswerAppearsSelected,
  thenPrevButtonIsDisabled,
  thenPrevButtonIsEnabled,
  thenNextButtonIsDisabled,
} from "./fixtures/exam-test-fixture";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/shared/lib", () => ({
  useIsMobile: () => false,
}));

jest.mock("@/modules/exam", () => require("../__mocks__/exam"));

describe("시험 모드 (TestModePage)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    givenExamDataIsReady();
    givenTestModeMocksAllowExamEnd();
  });

  test("시험 문제를 불러오는 동안에는 사용자에게 로딩 안내 문구가 보인다", () => {
    // Given: 시험 문제를 불러오는 중인 상태
    givenExamIsLoading();

    // When: 시험 모드 화면을 연다
    renderTestModePage({ yearId: "2023" });

    // Then: "문제를 불러오는 중" 문구가 보인다
    thenUserSeesLoadingMessage();
  });

  test("문제를 불러오는데 실패하면 사용자에게 에러 안내가 보인다", () => {
    // Given: 시험 문제 로드에 실패한 상태
    givenExamHasError();

    // When: 시험 모드 화면을 연다
    renderTestModePage({ yearId: "2023" });

    // Then: "문제를 불러오는데 실패했습니다" 문구가 보인다
    thenUserSeesErrorMessage();
  });

  test("시험 정보가 없으면 사용자에게 올바르지 않다는 안내가 보인다", () => {
    // Given: 시험 정보가 없거나 유효하지 않은 상태
    givenExamIsEmptyOrInvalid();

    // When: 시험 모드 화면을 연다 (yearId 없음)
    renderTestModePage();

    // Then: "시험 정보가 올바르지 않습니다" 문구가 보인다
    thenUserSeesInvalidExamMessage();
  });

  test("사용자가 답안을 선택하면 해당 보기가 선택된 것처럼 보인다", () => {
    // Given: 시험 데이터가 준비된 상태
    // When: 시험 모드 화면을 열고 두 번째 보기를 선택한다
    renderTestModePage({ yearId: "2023" });
    whenUserClicksAnswer(2);

    // Then: 해당 보기에 선택 상태가 반영되어 보인다
    thenAnswerAppearsSelected(2);
  });

  test("첫 번째 문제에서는 이전 버튼이 비활성화되고, 마지막 문제에서는 다음 버튼이 비활성화된다", () => {
    // Given: 시험 데이터가 준비된 상태
    renderTestModePage({ yearId: "2023" });

    // When: 첫 화면에서 다음으로 두 번 이동한다
    // Then: 처음에는 이전 버튼이 비활성화되어 있다
    thenPrevButtonIsDisabled();
    whenUserClicksNext();
    thenPrevButtonIsEnabled();
    whenUserClicksNext();
    thenNextButtonIsDisabled();
  });

  test("사용자가 시험을 종료하면 시험 결과 화면과 획득 점수가 보인다", async () => {
    // Given: 시험 데이터가 준비된 상태
    renderTestModePage({ yearId: "2023" });

    // When: 첫 번째 문제에 답을 선택하고 시험 종료(제출)를 한다
    whenUserClicksAnswer(2);
    await whenUserEndsExam();

    // Then: "시험 결과"와 "획득 점수"가 보인다
    thenUserSeesResultScreen();
  });

  test("문제 목록이 비어 있으면 사용자에게 에러 안내가 보인다", () => {
    // Given: 시험은 있으나 문제가 하나도 없는 상태
    givenExamHasNoQuestions();

    // When: 시험 모드 화면을 연다
    renderTestModePage({ yearId: "2023" });

    // Then: "문제를 불러오는데 실패했습니다" 문구가 보인다
    thenUserSeesErrorMessage();
  });

  test("이전/다음 버튼을 빠르게 연타해도 현재 문제 위치가 깨지지 않고, 첫 문제에서 이전은 비활성화된 상태로 유지된다", () => {
    // Given: 시험 데이터가 준비된 상태
    renderTestModePage({ yearId: "2023" });

    // When: 다음을 두 번, 이전을 두 번 빠르게 누른다
    whenUserClicksNext();
    whenUserClicksNext();
    whenUserClicksPrev();
    whenUserClicksPrev();

    // Then: 다시 첫 문제에 있으며 이전 버튼은 비활성화되어 있다
    thenPrevButtonIsDisabled();
  });
});
