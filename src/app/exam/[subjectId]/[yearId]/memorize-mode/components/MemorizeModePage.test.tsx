import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemorizeModePage } from "./MemorizeModePage";
import { useExamContext } from "@/contexts";
import {
  useExamQuestionsWithAnswersQuery,
  useTutorQuestionExplanationMutation,
} from "../hooks/service";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    alt,
    fill,
    ...rest
  }: {
    alt?: string;
    fill?: boolean;
  } & Record<string, unknown>) => {
    void fill;
    return <img alt={alt ?? ""} {...rest} />;
  },
}));

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

jest.mock("@/lib/useCopyProtection", () => ({
  useCopyProtection: jest.fn(),
}));

jest.mock("@/contexts", () => ({
  useExamContext: jest.fn(),
}));

jest.mock("../hooks/service", () => ({
  useExamQuestionsWithAnswersQuery: jest.fn(),
  useTutorQuestionExplanationMutation: jest.fn(),
}));

jest.mock("@/components/chatbot", () => ({
  ChatbotPanel: ({
    open,
    questionId,
  }: {
    open: boolean;
    questionId?: number;
  }) => (open ? <div>chatbot-open-{questionId}</div> : null),
}));

jest.mock("@/components/ui", () => ({
  Breadcrumb: ({
    subject,
    year,
  }: {
    subject?: string;
    year?: string;
  }) => (
    <div>
      breadcrumb-{subject}-{year}
    </div>
  ),
  Toggle: ({
    checked,
    onChange,
    label,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
  }) => (
    <button type="button" onClick={() => onChange(!checked)}>
      {label}:{String(checked)}
    </button>
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
    prevDisabled,
    answerDisabled,
    nextDisabled,
    answerLabel,
  }: {
    onPrevClick: () => void;
    onAnswerClick: () => void;
    onNextClick: () => void;
    prevDisabled?: boolean;
    answerDisabled?: boolean;
    nextDisabled?: boolean;
    answerLabel?: string;
  }) => (
    <div>
      <button type="button" onClick={onPrevClick} disabled={prevDisabled}>
        이전
      </button>
      <button type="button" onClick={onAnswerClick} disabled={answerDisabled}>
        {answerLabel ?? "정답 확인"}
      </button>
      <button type="button" onClick={onNextClick} disabled={nextDisabled}>
        다음
      </button>
    </div>
  ),
}));

const mockedUseExamContext = useExamContext as jest.MockedFunction<
  typeof useExamContext
>;
const mockedUseExamQuestionsWithAnswersQuery =
  useExamQuestionsWithAnswersQuery as jest.MockedFunction<
    typeof useExamQuestionsWithAnswersQuery
  >;
const mockedUseTutorQuestionExplanationMutation =
  useTutorQuestionExplanationMutation as jest.MockedFunction<
    typeof useTutorQuestionExplanationMutation
  >;

const questions = [
  {
    id: 101,
    number: 1,
    text: "첫 번째 문제",
    example: "첫 예시",
    choices: [
      { id: 1, number: 1, text: "1번" },
      { id: 2, number: 2, text: "2번" },
    ],
    correctAnswers: [2],
    explanation: "기본 해설 1",
  },
  {
    id: 102,
    number: 2,
    text: "두 번째 문제",
    choices: [
      { id: 3, number: 1, text: "가" },
      { id: 4, number: 2, text: "나" },
    ],
    correctAnswers: [1],
    explanation: "기본 해설 2",
  },
];

describe("MemorizeModePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockedUseExamContext.mockReturnValue({
      isExamMode: false,
      isSubmitted: false,
      setIsExamMode: jest.fn(),
      setIsSubmitted: jest.fn(),
      onExamEnd: jest.fn(),
      setOnExamEnd: jest.fn(),
      unansweredCount: 0,
      setUnansweredCount: jest.fn(),
      totalQuestions: 0,
      setTotalQuestions: jest.fn(),
      isExplanationVisible: true,
      setIsExplanationVisible: jest.fn(),
    });
    mockedUseExamQuestionsWithAnswersQuery.mockReturnValue({
      data: {
        exam: {
          id: 1,
          subject: "교육학",
          title: "교육학 2025",
          totalQuestions: 2,
          year: 2025,
        },
        questions,
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useExamQuestionsWithAnswersQuery>);
    mockedUseTutorQuestionExplanationMutation.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({
        success: true,
        explanation: "튜터 해설",
        conceptTags: ["핵심"],
      }),
    } as ReturnType<typeof useTutorQuestionExplanationMutation>);
  });

  it("renders the current question and stores the post-login redirect path", () => {
    render(<MemorizeModePage subjectId="subject" yearId="2025" />);

    expect(screen.getByText("암기모드 | 1 / 2")).toBeInTheDocument();
    expect(screen.getByText("1. 첫 번째 문제")).toBeInTheDocument();
    expect(sessionStorage.getItem("qknou_post_login_redirect")).toBe(
      "/exam/subject/2025/memorize-mode"
    );
  });

  it("renders a loading state while questions are being fetched", () => {
    mockedUseExamQuestionsWithAnswersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useExamQuestionsWithAnswersQuery>);

    render(<MemorizeModePage subjectId="subject" yearId="2025" />);

    expect(screen.getByText("문제를 불러오는 중...")).toBeInTheDocument();
  });

  it("renders an error state when question loading fails", () => {
    mockedUseExamQuestionsWithAnswersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useExamQuestionsWithAnswersQuery>);

    render(<MemorizeModePage subjectId="subject" yearId="2025" />);

    expect(screen.getByText("문제를 불러오는데 실패했습니다.")).toBeInTheDocument();
  });

  it("reveals the explanation after checking the answer and opens the chatbot", async () => {
    const user = userEvent.setup();

    render(<MemorizeModePage subjectId="subject" yearId="2025" />);

    await user.click(screen.getByRole("button", { name: "2번" }));
    await user.click(screen.getByRole("button", { name: "정답 확인" }));

    await waitFor(() => {
      expect(screen.getByText("튜터 해설")).toBeInTheDocument();
    });
    expect(screen.getByText("#핵심")).toBeInTheDocument();
    expect(screen.getByText("show-result:true")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "챗봇" }));

    expect(screen.getByText("chatbot-open-101")).toBeInTheDocument();
  });

  it("remembers the solved state when moving between questions and resets on demand", async () => {
    const user = userEvent.setup();

    render(<MemorizeModePage subjectId="subject" yearId="2025" />);

    await user.click(screen.getByRole("button", { name: "2번" }));
    await user.click(screen.getByRole("button", { name: "정답 확인" }));
    await waitFor(() => {
      expect(screen.getByText("튜터 해설")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "다음" }));
    expect(screen.getByText("2. 두 번째 문제")).toBeInTheDocument();
    expect(screen.getByText("selected:none")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "이전" }));
    expect(screen.getByText("1. 첫 번째 문제")).toBeInTheDocument();
    expect(screen.getByText("selected:2")).toBeInTheDocument();
    expect(screen.getByText("show-result:true")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "다시 풀기" }));
    expect(screen.getByText("selected:none")).toBeInTheDocument();
    expect(screen.getByText("show-result:false")).toBeInTheDocument();
  });

  it("shows an explanation error when tutor explanation loading fails", async () => {
    const user = userEvent.setup();

    mockedUseTutorQuestionExplanationMutation.mockReturnValue({
      mutateAsync: jest.fn().mockRejectedValue(new Error("failed")),
    } as ReturnType<typeof useTutorQuestionExplanationMutation>);

    render(<MemorizeModePage subjectId="subject" yearId="2025" />);

    await user.click(screen.getByRole("button", { name: "2번" }));
    await user.click(screen.getByRole("button", { name: "정답 확인" }));

    await waitFor(() => {
      expect(
        screen.getByText("해설을 불러오지 못했습니다. 다시 시도해 주세요.")
      ).toBeInTheDocument();
    });
  });
});
