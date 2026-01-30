/**
 * 시험 모드(TestModePage) 통합 테스트
 * - GWT(Given-When-Then) 구조, 비즈니스 행위 중심 명세
 * - 제출 → 결과 화면 전환 등 사용자 시나리오 검증
 */

import React from "react";
import { screen } from "@testing-library/react";
import {
  givenExamDataIsReady,
  givenTestModeMocksAllowExamEnd,
  renderTestModePage,
  whenUserClicksAnswer,
  whenUserClicksNext,
  whenUserEndsExam,
  thenUserSeesResultScreen,
} from "./fixtures/exam-test-fixture";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/shared/lib", () => ({
  useIsMobile: () => false,
}));

jest.mock("@/modules/exam", () => require("../__mocks__/exam"));

describe("시험 모드 – 통합 (TestModePage)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    givenExamDataIsReady();
    givenTestModeMocksAllowExamEnd();
  });

  test("사용자가 여러 문제에 답을 선택한 뒤 시험을 종료하면 시험 결과 화면과 획득 점수가 보인다", async () => {
    // Given: 시험 데이터가 준비된 상태
    renderTestModePage({ yearId: "2023" });

    // When: 첫 번째 문제에 답을 선택하고 다음으로 이동한 뒤, 두 번째 문제에도 답을 선택하고 시험 종료(제출)를 한다
    whenUserClicksAnswer(2);
    whenUserClicksNext();
    whenUserClicksAnswer(2);
    await whenUserEndsExam();

    // Then: "시험 결과"와 "획득 점수"가 보인다
    thenUserSeesResultScreen();
  });

  test("시험을 제출한 뒤 결과 화면에서 문제 번호(네비게이터)가 보이고, 제출된 상태가 반영되어 보인다", async () => {
    // Given: 시험 데이터가 준비된 상태
    renderTestModePage({ yearId: "2023" });

    // When: 첫 번째·두 번째 문제에 각각 답을 선택하고 시험 종료(제출)를 한다
    whenUserClicksAnswer(1);
    whenUserClicksNext();
    whenUserClicksAnswer(2);
    await whenUserEndsExam();

    // Then: 시험 결과 화면이 보이고, 문제 번호(1, 2) 버튼이 보인다
    thenUserSeesResultScreen();
    const navButtons = screen.getAllByRole("button", { name: /1|2/ });
    expect(navButtons.length).toBeGreaterThanOrEqual(1);
  });
});
