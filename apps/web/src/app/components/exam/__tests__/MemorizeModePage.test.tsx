/**
 * MemorizeModePage – unit tests
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

describe("MemorizeModePage – unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useExamQuestionsWithAnswersQuery } = require("../__mocks__/exam");
    useExamQuestionsWithAnswersQuery.mockReturnValue({
      data: require("../__mocks__/exam").mockExamData,
      isLoading: false,
      isError: false,
    });
  });

  test("renders loading UI", () => {
    const { useExamQuestionsWithAnswersQuery } = require("../__mocks__/exam");
    useExamQuestionsWithAnswersQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    render(<MemorizeModePage yearId="2023" />);
    expect(screen.getByText(/문제를 불러오는 중/)).toBeInTheDocument();
  });

  test("renders error UI", () => {
    const { useExamQuestionsWithAnswersQuery } = require("../__mocks__/exam");
    useExamQuestionsWithAnswersQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    render(<MemorizeModePage yearId="2023" />);
    expect(screen.getByText(/문제를 불러오는데 실패했습니다/)).toBeInTheDocument();
  });

  test("selects answer updates selectedAnswer state", () => {
    render(<MemorizeModePage yearId="2023" />);
    const answerBtn = screen.getByTestId("answer-1");
    fireEvent.click(answerBtn);
    expect(answerBtn).toHaveAttribute("aria-checked", "true");
  });

  test("showResult button reveals explanation", () => {
    render(<MemorizeModePage yearId="2023" />);
    fireEvent.click(screen.getByTestId("answer-1"));
    fireEvent.click(screen.getByTestId("answer-button"));
    expect(screen.getByText(/해설/)).toBeInTheDocument();
  });

  test("prev navigation stores and restores state", () => {
    render(<MemorizeModePage yearId="2023" />);
    fireEvent.click(screen.getByTestId("answer-2"));
    fireEvent.click(screen.getByTestId("answer-button"));
    fireEvent.click(screen.getByTestId("next-button"));
    fireEvent.click(screen.getByTestId("prev-button"));
    // 1번 문제로 돌아왔을 때 정답 보기 상태가 복원되어 해설이 보여야 함
    expect(screen.getByText(/해설/)).toBeInTheDocument();
    expect(screen.getByTestId("answer-button")).toBeDisabled();
  });

  test("reset button clears answer and result", () => {
    render(<MemorizeModePage yearId="2023" />);
    fireEvent.click(screen.getByTestId("answer-1"));
    fireEvent.click(screen.getByTestId("answer-button"));
    const resetButtons = screen.getAllByTestId("reset-button");
    fireEvent.click(resetButtons[0]);
    const answer1 = screen.queryByTestId("answer-1");
    expect(answer1).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByText(/해설/)).not.toBeInTheDocument();
  });

  test("breadcrumb shows correct subject/year", () => {
    render(<MemorizeModePage subjectId="1" yearId="2023" />);
    expect(screen.getByText(/수학/)).toBeInTheDocument();
    expect(screen.getByText(/2023/)).toBeInTheDocument();
  });
});
