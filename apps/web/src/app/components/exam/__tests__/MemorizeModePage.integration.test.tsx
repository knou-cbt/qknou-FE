/**
 * MemorizeModePage – integration tests
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemorizeModePage } from "../MemorizeModePage";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/shared/lib", () => ({
  useIsMobile: () => false,
}));

jest.mock("@/modules/exam", () => require("../__mocks__/exam"));

describe("MemorizeModePage – integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useExamQuestionsWithAnswersQuery } = require("../__mocks__/exam");
    useExamQuestionsWithAnswersQuery.mockReturnValue({
      data: require("../__mocks__/exam").mockExamData,
      isLoading: false,
      isError: false,
    });
  });

  test("answer button disables after result shown", () => {
    render(<MemorizeModePage yearId="2023" />);
    fireEvent.click(screen.getByTestId("answer-1"));
    fireEvent.click(screen.getByTestId("answer-button"));
    // 정답 보기 후 state는 correct/incorrect로 바뀌어 aria-checked는 false가 됨
    expect(screen.getByTestId("answer-button")).toBeDisabled();
    expect(screen.getByText(/해설/)).toBeInTheDocument();
  });

  test("prev/next preserves remembered answers", () => {
    render(<MemorizeModePage yearId="2023" />);
    fireEvent.click(screen.getByTestId("answer-1"));
    fireEvent.click(screen.getByTestId("answer-button"));
    fireEvent.click(screen.getByTestId("next-button"));
    fireEvent.click(screen.getByTestId("prev-button"));
    // 이전 문제로 돌아왔을 때 해설·정답 확인 상태가 복원되어야 함
    expect(screen.getByTestId("answer-button")).toBeDisabled();
    expect(screen.getByText(/해설/)).toBeInTheDocument();
  });
});
