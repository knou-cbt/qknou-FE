/**
 * TestModePage – unit tests
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

describe("TestModePage – unit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useExamQuestionsQuery, useExamContext, useExamSubmitMutation } =
      require("../__mocks__/exam");
    useExamQuestionsQuery.mockReturnValue({
      data: require("../__mocks__/exam").mockExamData,
      isLoading: false,
      isError: false,
    });
    useExamContext.mockReturnValue({
      setOnExamEnd: jest.fn((fn) => {
        if (typeof fn === "function") (window as unknown as { __onExamEnd: () => void }).__onExamEnd = fn;
      }),
      setUnansweredCount: jest.fn(),
      setTotalQuestions: jest.fn(),
      setIsSubmitted: jest.fn(),
    });
    useExamSubmitMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({
        results: [
          { questionId: 1, isCorrect: true, selectedAnswer: 2, correctAnswers: [2] },
          { questionId: 2, isCorrect: false, selectedAnswer: 1, correctAnswers: [2] },
        ],
      }),
    });
  });

  test("renders loading UI", () => {
    const { useExamQuestionsQuery } = require("../__mocks__/exam");
    useExamQuestionsQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    render(<TestModePage yearId="2023" />);
    expect(screen.getByText(/문제를 불러오는 중/)).toBeInTheDocument();
  });

  test("renders error UI", () => {
    const { useExamQuestionsQuery } = require("../__mocks__/exam");
    useExamQuestionsQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    render(<TestModePage yearId="2023" />);
    expect(screen.getByText(/문제를 불러오는데 실패했습니다/)).toBeInTheDocument();
  });

  test("renders missing examId warning", () => {
    const { useExamQuestionsQuery } = require("../__mocks__/exam");
    useExamQuestionsQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: false,
    });
    render(<TestModePage />);
    expect(screen.getByText(/시험 정보가 올바르지 않습니다/)).toBeInTheDocument();
  });

  test("selecting an answer updates state", () => {
    render(<TestModePage yearId="2023" />);
    const answerBtn = screen.getByTestId("answer-2");
    fireEvent.click(answerBtn);
    expect(answerBtn).toHaveAttribute("aria-checked", "true");
  });

  test("prev/next navigation works and disables correctly", () => {
    render(<TestModePage yearId="2023" />);
    const prevBtn = screen.getByTestId("prev-button");
    const nextBtn = screen.getByTestId("next-button");
    expect(prevBtn).toBeDisabled();
    fireEvent.click(nextBtn);
    expect(prevBtn).not.toBeDisabled();
    fireEvent.click(nextBtn);
    expect(nextBtn).toBeDisabled();
  });

  test("handleSubmit sends correct payload and shows result UI", async () => {
    const { useExamContext, useExamSubmitMutation } = require("../__mocks__/exam");
    const mutateAsync = jest.fn().mockResolvedValue({
      results: [
        { questionId: 1, isCorrect: true, selectedAnswer: 2, correctAnswers: [2] },
        { questionId: 2, isCorrect: false, selectedAnswer: 1, correctAnswers: [2] },
      ],
    });
    useExamSubmitMutation.mockReturnValue({ mutateAsync });
    const setOnExamEnd = jest.fn((fn) => {
      if (typeof fn === "function") (window as unknown as { __onExamEnd: () => void }).__onExamEnd = fn;
    });
    useExamContext.mockReturnValue({
      setOnExamEnd,
      setUnansweredCount: jest.fn(),
      setTotalQuestions: jest.fn(),
      setIsSubmitted: jest.fn(),
    });

    render(<TestModePage yearId="2023" />);
    fireEvent.click(screen.getByTestId("answer-2"));
    const onExamEnd = (window as unknown as { __onExamEnd?: () => void }).__onExamEnd;
    expect(onExamEnd).toBeDefined();
    await act(async () => {
      await onExamEnd?.();
    });
    expect(mutateAsync).toHaveBeenCalledWith({
      answers: [
        { questionId: 1, selectedAnswer: 2 },
        { questionId: 2, selectedAnswer: null },
      ],
    });
    expect(screen.getByText(/시험 결과/)).toBeInTheDocument();
    expect(screen.getByText(/획득 점수/)).toBeInTheDocument();
  });

  test("empty question list shows error UI", () => {
    const { useExamQuestionsQuery } = require("../__mocks__/exam");
    useExamQuestionsQuery.mockReturnValueOnce({
      data: { exam: {}, questions: [] },
      isLoading: false,
      isError: false,
    });
    render(<TestModePage yearId="2023" />);
    expect(screen.getByText(/문제를 불러오는데 실패했습니다/)).toBeInTheDocument();
  });

  test("rapid clicking prev/next does not corrupt state", () => {
    render(<TestModePage yearId="2023" />);
    const prevBtn = screen.getByTestId("prev-button");
    const nextBtn = screen.getByTestId("next-button");
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    fireEvent.click(prevBtn);
    fireEvent.click(prevBtn);
    expect(prevBtn).toBeDisabled();
  });
});
