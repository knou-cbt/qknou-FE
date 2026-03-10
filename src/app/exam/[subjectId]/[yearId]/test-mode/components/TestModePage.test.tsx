import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestModePage } from "./TestModePage";
import { useRouter } from "next/navigation";
import { useExamContext } from "@/contexts";
import { useIsMobile } from "@/lib/useIsMobile";
import {
  useExamQuestionsQuery,
  useExamSubmitMutation,
} from "../hooks/service";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

jest.mock("@/lib/useCopyProtection", () => ({
  useCopyProtection: jest.fn(),
}));

jest.mock("@/lib/useIsMobile", () => ({
  useIsMobile: jest.fn(),
}));

jest.mock("@/contexts", () => ({
  useExamContext: jest.fn(),
}));

jest.mock("../hooks/service", () => ({
  useExamQuestionsQuery: jest.fn(),
  useExamSubmitMutation: jest.fn(),
}));

jest.mock("@/constants", () => ({
  API_URL: "https://api.example.com",
}));

jest.mock("@/components/ui", () => ({
  Button: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  QuestionNavigator: ({
    currentQuestion,
    totalQuestions,
    onQuestionSelect,
  }: {
    currentQuestion: number;
    totalQuestions: number;
    onQuestionSelect: (questionNumber: number) => void;
  }) => (
    <div>
      <div>
        navigator-{currentQuestion}/{totalQuestions}
      </div>
      {Array.from({ length: totalQuestions }, (_, index) => (
        <button
          key={index + 1}
          type="button"
          onClick={() => onQuestionSelect(index + 1)}
        >
          문항 {index + 1}
        </button>
      ))}
    </div>
  ),
  QuestionCard: ({
    question,
    answers,
    selectedAnswer,
    showResult,
    correctAnswer,
    onAnswerSelect,
  }: {
    question?: string;
    answers: Array<{ value: string | number; label: string }>;
    selectedAnswer: string | number | null;
    showResult: boolean;
    correctAnswer: number[];
    onAnswerSelect?: (value: string | number) => void;
  }) => (
    <div>
      <div>{question}</div>
      <div>selected:{selectedAnswer ?? "none"}</div>
      <div>show-result:{String(showResult)}</div>
      <div>correct:{correctAnswer.join(",")}</div>
      {answers.map((answer) => (
        <button
          key={String(answer.value)}
          type="button"
          onClick={() => onAnswerSelect?.(answer.value)}
        >
          {answer.label}
        </button>
      ))}
    </div>
  ),
  ExamNavButtons: ({
    onPrevClick,
    onAnswerClick,
    onNextClick,
    showAnswer = true,
    prevDisabled,
    nextDisabled,
    answerLabel,
  }: {
    onPrevClick: () => void;
    onAnswerClick?: () => void;
    onNextClick: () => void;
    showAnswer?: boolean;
    prevDisabled?: boolean;
    nextDisabled?: boolean;
    answerLabel?: string;
  }) => (
    <div>
      <button type="button" onClick={onPrevClick} disabled={prevDisabled}>
        이전
      </button>
      {showAnswer ? (
        <button type="button" onClick={onAnswerClick}>
          {answerLabel ?? "해설 보기"}
        </button>
      ) : null}
      <button type="button" onClick={onNextClick} disabled={nextDisabled}>
        다음
      </button>
    </div>
  ),
}));

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseExamContext = useExamContext as jest.MockedFunction<
  typeof useExamContext
>;
const mockedUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;
const mockedUseExamQuestionsQuery =
  useExamQuestionsQuery as jest.MockedFunction<typeof useExamQuestionsQuery>;
const mockedUseExamSubmitMutation =
  useExamSubmitMutation as jest.MockedFunction<typeof useExamSubmitMutation>;

const pushMock = jest.fn();
const setOnExamEndMock = jest.fn();
const setUnansweredCountMock = jest.fn();
const setTotalQuestionsMock = jest.fn();
const setIsSubmittedMock = jest.fn();

const testQuestions = [
  {
    id: 201,
    number: 1,
    text: "시험 문제 1",
    explanation: "기본 시험 해설 1",
    choices: [
      { id: 1, number: 1, text: "보기 1" },
      { id: 2, number: 2, text: "보기 2" },
    ],
  },
  {
    id: 202,
    number: 2,
    explanation: "기본 시험 해설 2",
    text: "시험 문제 2",
    choices: [
      { id: 3, number: 1, text: "보기 A" },
      { id: 4, number: 2, text: "보기 B" },
    ],
  },
];

describe("TestModePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockedUseRouter.mockReturnValue({ push: pushMock } as ReturnType<
      typeof useRouter
    >);
    mockedUseIsMobile.mockReturnValue(false);
    mockedUseExamContext.mockReturnValue({
      isExamMode: false,
      isSubmitted: false,
      setIsExamMode: jest.fn(),
      setIsSubmitted: setIsSubmittedMock,
      onExamEnd: jest.fn(),
      setOnExamEnd: setOnExamEndMock,
      unansweredCount: 0,
      setUnansweredCount: setUnansweredCountMock,
      totalQuestions: 0,
      setTotalQuestions: setTotalQuestionsMock,
      isExplanationVisible: true,
      setIsExplanationVisible: jest.fn(),
    });
    mockedUseExamQuestionsQuery.mockReturnValue({
      data: {
        exam: {
          id: 1,
          subject: "교육학",
          title: "교육학 기출",
          totalQuestions: 2,
          year: 2025,
        },
        questions: testQuestions,
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useExamQuestionsQuery>);
    mockedUseExamSubmitMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({
        results: [
          {
            questionId: 201,
            selectedAnswer: 2,
            correctAnswers: [2],
            isCorrect: true,
          },
          {
            questionId: 202,
            selectedAnswer: null,
            correctAnswers: [1],
            isCorrect: false,
          },
        ],
      }),
    } as ReturnType<typeof useExamSubmitMutation>);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        explanation: "생성된 해설",
        conceptTags: ["포인트"],
        generated: true,
      }),
    }) as jest.Mock;
  });

  it("renders the exam page, syncs counts and stores the redirect path", async () => {
    render(<TestModePage subjectId="subject" yearId="2025" />);

    expect(screen.getByText("교육학 기출 | 시험모드 | 1 / 2")).toBeInTheDocument();
    expect(screen.getByText("1. 시험 문제 1")).toBeInTheDocument();
    expect(sessionStorage.getItem("qknou_post_login_redirect")).toBe(
      "/exam/subject/2025/test-mode"
    );

    await waitFor(() => {
      expect(setTotalQuestionsMock).toHaveBeenCalledWith(2);
      expect(setUnansweredCountMock).toHaveBeenCalledWith(2);
      expect(setOnExamEndMock).toHaveBeenCalled();
    });
  });

  it("renders an invalid exam message when yearId is missing", () => {
    render(<TestModePage subjectId="subject" />);

    expect(screen.getByText("시험 정보가 올바르지 않습니다.")).toBeInTheDocument();
  });

  it("renders a loading state while questions are being fetched", () => {
    mockedUseExamQuestionsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useExamQuestionsQuery>);

    render(<TestModePage subjectId="subject" yearId="2025" />);

    expect(screen.getByText("문제를 불러오는 중...")).toBeInTheDocument();
  });

  it("renders an error state when question loading fails", () => {
    mockedUseExamQuestionsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useExamQuestionsQuery>);

    render(<TestModePage subjectId="subject" yearId="2025" />);

    expect(screen.getByText("문제를 불러오는데 실패했습니다.")).toBeInTheDocument();
  });

  it("updates answers and question navigation in progress mode", async () => {
    const user = userEvent.setup();

    render(<TestModePage subjectId="subject" yearId="2025" />);

    await user.click(screen.getByRole("button", { name: "보기 2" }));
    expect(screen.getByText("selected:2")).toBeInTheDocument();

    await waitFor(() => {
      expect(setUnansweredCountMock).toHaveBeenLastCalledWith(1);
    });

    await user.click(screen.getByRole("button", { name: "문항 2" }));
    expect(screen.getByText("2. 시험 문제 2")).toBeInTheDocument();
  });

  it("submits through the registered exam-end handler and shows result stats", async () => {
    const user = userEvent.setup();

    render(<TestModePage subjectId="subject" yearId="2025" />);

    await user.click(screen.getByRole("button", { name: "보기 2" }));

    const registeredHandler = setOnExamEndMock.mock.calls[0][0] as () => void;
    await act(async () => {
      await registeredHandler();
    });

    await waitFor(() => {
      expect(screen.getByText("시험 결과")).toBeInTheDocument();
    });

    expect(setIsSubmittedMock).toHaveBeenCalledWith(true);
    expect(screen.getByText("정답률")).toBeInTheDocument();
    expect(screen.getAllByText("1개")).toHaveLength(2);
    expect(screen.getByText("show-result:true")).toBeInTheDocument();
  });

  it("loads generated explanations in the result view and returns home", async () => {
    const user = userEvent.setup();

    render(<TestModePage subjectId="subject" yearId="2025" />);

    const registeredHandler = setOnExamEndMock.mock.calls[0][0] as () => void;
    await act(async () => {
      await registeredHandler();
    });

    await waitFor(() => {
      expect(screen.getByText("시험 결과")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "해설 보기" }));

    await waitFor(() => {
      expect(screen.getByText("생성된 해설")).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/api/tutor/questions/201/explanation",
      expect.objectContaining({ method: "GET" })
    );
    expect(screen.getByText("#포인트")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "홈으로 돌아가기" }));
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("shows an explanation error when result explanation loading fails", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    render(<TestModePage subjectId="subject" yearId="2025" />);

    const registeredHandler = setOnExamEndMock.mock.calls[0][0] as () => void;
    await act(async () => {
      await registeredHandler();
    });

    await waitFor(() => {
      expect(screen.getByText("시험 결과")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "해설 보기" }));

    await waitFor(() => {
      expect(
        screen.getByText("해설을 불러오지 못했습니다. 다시 시도해 주세요.")
      ).toBeInTheDocument();
    });
  });
});
