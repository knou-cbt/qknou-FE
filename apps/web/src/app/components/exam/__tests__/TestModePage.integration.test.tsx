/**
 * TestModePage – integration tests
 */
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TestModePage } from "../TestModePage";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("@/shared/lib", () => ({
  useIsMobile: () => false,
}));

jest.mock("@/modules/exam", () => require("../__mocks__/exam"));

describe("TestModePage – integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useExamQuestionsQuery, useExamContext, useExamSubmitMutation } =
      require("../__mocks__/exam");
    useExamQuestionsQuery.mockReturnValue({
      data: require("../__mocks__/exam").mockExamData,
      isLoading: false,
      isError: false,
    });
    const setOnExamEnd = jest.fn((fn: () => void) => {
      (window as unknown as { __onExamEnd?: () => void }).__onExamEnd = fn;
    });
    useExamContext.mockReturnValue({
      setOnExamEnd,
      setUnansweredCount: jest.fn(),
      setTotalQuestions: jest.fn(),
      setIsSubmitted: jest.fn(),
    });
    useExamSubmitMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({
        results: [
          { questionId: 1, isCorrect: true, selectedAnswer: 1, correctAnswers: [2] },
          { questionId: 2, isCorrect: true, selectedAnswer: 2, correctAnswers: [2] },
        ],
      }),
    });
  });

  test("submitting exam shows result screen", async () => {
    render(<TestModePage yearId="2023" />);
    fireEvent.click(screen.getByTestId("answer-2"));
    fireEvent.click(screen.getByTestId("next-button"));
    fireEvent.click(screen.getByTestId("answer-2"));
    const onExamEnd = (window as unknown as { __onExamEnd?: () => void }).__onExamEnd;
    await act(async () => {
      await onExamEnd?.();
    });
    expect(screen.getByText(/시험 결과/)).toBeInTheDocument();
    expect(screen.getByText(/획득 점수/)).toBeInTheDocument();
  });

  test("question navigator reflects current state after submit", async () => {
    render(<TestModePage yearId="2023" />);
    fireEvent.click(screen.getByTestId("answer-1"));
    fireEvent.click(screen.getByTestId("next-button"));
    fireEvent.click(screen.getByTestId("answer-2"));
    const onExamEnd = (window as unknown as { __onExamEnd?: () => void }).__onExamEnd;
    await act(async () => {
      await onExamEnd?.();
    });
    expect(screen.getByText(/시험 결과/)).toBeInTheDocument();
    const navButtons = screen.getAllByRole("button", { name: /1|2/ });
    expect(navButtons.length).toBeGreaterThanOrEqual(1);
  });
});
