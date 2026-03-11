import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname, useRouter } from "next/navigation";
import { ExamProvider } from "@/contexts";
import { AppContent } from "@/components/app-content";
import { TestModePage } from "@/app/exam/[subjectId]/[yearId]/test-mode/components/TestModePage";
import {
  useExamQuestionsQuery,
  useExamSubmitMutation,
} from "@/app/exam/[subjectId]/[yearId]/test-mode/hooks/service";
import { useIsMobile } from "@/lib/useIsMobile";
import { useAuth } from "@/contexts/AuthContext";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

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

jest.mock("@/lib/useIsMobile", () => ({
  useIsMobile: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/app/exam/[subjectId]/[yearId]/test-mode/hooks/service", () => ({
  useExamQuestionsQuery: jest.fn(),
  useExamSubmitMutation: jest.fn(),
}));

jest.mock("@/components/ui", () => ({
  Button: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  ),
  ConfirmModal: ({
    open,
    title,
    message,
    confirmText = "확인",
    cancelText = "취소",
    onClose,
    onConfirm,
  }: {
    open: boolean;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
    onConfirm: () => void;
  }) =>
    open ? (
      <div>
        <div>{title}</div>
        <div>{message}</div>
        <button type="button" onClick={onClose}>
          {cancelText}
        </button>
        <button type="button" onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    ) : null,
  AlertModal: ({
    open,
    title,
    message,
    confirmText = "확인",
    onClose,
  }: {
    open: boolean;
    title: string;
    message?: React.ReactNode;
    confirmText?: string;
    onClose: () => void;
  }) =>
    open ? (
      <div>
        <div>{title}</div>
        {message ? <div>{message}</div> : null}
        <button type="button" onClick={onClose}>
          {confirmText}
        </button>
      </div>
    ) : null,
  QuestionNavigator: ({
    currentQuestion,
    totalQuestions,
  }: {
    currentQuestion: number;
    totalQuestions: number;
  }) => <div>navigator-{currentQuestion}/{totalQuestions}</div>,
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
    answerDisabled,
    answerLabel,
  }: {
    onPrevClick: () => void;
    onAnswerClick?: () => void;
    onNextClick: () => void;
    showAnswer?: boolean;
    prevDisabled?: boolean;
    nextDisabled?: boolean;
    answerDisabled?: boolean;
    answerLabel?: string;
  }) => (
    <div>
      <button type="button" onClick={onPrevClick} disabled={prevDisabled}>
        이전
      </button>
      {showAnswer ? (
        <button
          type="button"
          onClick={onAnswerClick}
          disabled={answerDisabled}
        >
          {answerLabel ?? "해설 보기"}
        </button>
      ) : null}
      <button type="button" onClick={onNextClick} disabled={nextDisabled}>
        다음
      </button>
    </div>
  ),
}));

jest.mock("@/components", () => {
  const actualHeader = jest.requireActual("@/components/header");

  return {
    Header: actualHeader.Header,
    Footer: () => <div data-testid="footer">footer</div>,
    KakaoAd: () => <div data-testid="kakao-ad">ad</div>,
  };
});

const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockedUseExamQuestionsQuery =
  useExamQuestionsQuery as jest.MockedFunction<typeof useExamQuestionsQuery>;
const mockedUseExamSubmitMutation =
  useExamSubmitMutation as jest.MockedFunction<typeof useExamSubmitMutation>;
const mockedUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("exam flow integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockedUsePathname.mockReturnValue("/exam/subject/2025/test-mode");
    mockedUseRouter.mockReturnValue({
      push: jest.fn(),
    } as ReturnType<typeof useRouter>);
    mockedUseIsMobile.mockReturnValue(false);
    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      login: jest.fn(),
      logout: jest.fn(),
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
        questions: [
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
        ],
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
  });

  it("lets a user answer, submit from the exam header, and land on the result state", async () => {
    const user = userEvent.setup();

    render(
      <ExamProvider>
        <AppContent>
          <TestModePage subjectId="subject" yearId="2025" />
        </AppContent>
      </ExamProvider>
    );

    expect(screen.getByRole("button", { name: "시험 종료" })).toBeInTheDocument();
    expect(screen.getByText("1. 시험 문제 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "보기 2" }));
    expect(screen.getByText("selected:2")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "시험 종료" }));
    expect(screen.getByText("시험 제출 확인")).toBeInTheDocument();
    expect(screen.getByText(/1개/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "제출하기" }));
    expect(screen.getByText("시험 제출 완료")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(screen.getByText("시험 결과")).toBeInTheDocument();
    });

    expect(screen.getByText("show-result:true")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute(
      "href",
      "/auth/login"
    );
  });
});
