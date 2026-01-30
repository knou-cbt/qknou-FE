/**
 * 암기 모드(MemorizeModePage) 통합 테스트
 * - GWT(Given-When-Then) 구조, 비즈니스 행위 중심 명세
 * - 정답 보기 후 상태·이동 시 복원 등 사용자 시나리오 검증
 */

import React from "react";
import {
  givenExamDataIsReady,
  renderMemorizeModePage,
  whenUserClicksAnswer,
  whenUserClicksShowAnswer,
  whenUserClicksPrev,
  whenUserClicksNext,
  thenUserSeesExplanation,
  thenShowAnswerButtonIsDisabled,
} from "./fixtures/exam-test-fixture";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/shared/lib", () => ({
  useIsMobile: () => false,
}));

jest.mock("@/modules/exam", () => require("../__mocks__/exam"));

describe("암기 모드 – 통합 (MemorizeModePage)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    givenExamDataIsReady();
  });

  test("사용자가 답을 선택한 뒤 정답 보기를 누르면 정답 보기 버튼이 비활성화되고 해설이 보인다", () => {
    // Given: 시험 데이터가 준비된 상태
    renderMemorizeModePage({ yearId: "2023" });

    // When: 첫 번째 보기를 선택하고 "정답 보기"를 누른다
    whenUserClicksAnswer(1);
    whenUserClicksShowAnswer();

    // Then: 정답 보기 버튼은 비활성화되어 있고, 해설이 보인다
    thenShowAnswerButtonIsDisabled();
    thenUserSeesExplanation();
  });

  test("정답 보기를 본 뒤 다음 문제로 갔다가 이전으로 돌아오면, 해당 문제의 해설과 정답 보기 상태가 그대로 복원되어 보인다", () => {
    // Given: 시험 데이터가 준비된 상태
    renderMemorizeModePage({ yearId: "2023" });

    // When: 첫 번째 보기를 선택하고 정답 보기를 누른 뒤, 다음 → 이전으로 이동한다
    whenUserClicksAnswer(1);
    whenUserClicksShowAnswer();
    whenUserClicksNext();
    whenUserClicksPrev();

    // Then: 다시 첫 문제에 있으며 해설이 보이고, 정답 보기 버튼은 비활성화되어 있다
    thenUserSeesExplanation();
    thenShowAnswerButtonIsDisabled();
  });
});
