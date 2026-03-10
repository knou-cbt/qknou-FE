import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./header";
import { useExamContext } from "@/contexts";
import { useAuth } from "@/contexts/AuthContext";

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

jest.mock("@/contexts", () => ({
  useExamContext: jest.fn(),
}));

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
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
}));

jest.mock("@/components/ui/user-menu", () => ({
  UserMenu: () => <div data-testid="user-menu">user menu</div>,
}));

const mockedUseExamContext = useExamContext as jest.MockedFunction<
  typeof useExamContext
>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

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

    mockedUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      login: jest.fn(),
      logout: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("renders the login button in default mode for guests", () => {
    render(<Header variant="default" />);

    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute(
      "href",
      "/auth/login"
    );
  });

  it("renders the user menu in default mode for authenticated users", () => {
    mockedUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: "user-1" },
      token: "token",
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<Header variant="default" />);

    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "로그인" })).not.toBeInTheDocument();
  });

  it("opens a confirm modal when ending an exam with unanswered questions", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockedUseExamContext.mockReturnValue({
      isExamMode: false,
      isSubmitted: false,
      setIsExamMode: jest.fn(),
      setIsSubmitted: jest.fn(),
      onExamEnd: jest.fn(),
      setOnExamEnd: jest.fn(),
      unansweredCount: 2,
      setUnansweredCount: jest.fn(),
      totalQuestions: 10,
      setTotalQuestions: jest.fn(),
      isExplanationVisible: true,
      setIsExplanationVisible: jest.fn(),
    });

    render(<Header variant="exam" />);

    await user.click(screen.getByRole("button", { name: "시험 종료" }));

    expect(screen.getByText("시험 제출 확인")).toBeInTheDocument();
    expect(screen.getByText(/2개/)).toBeInTheDocument();
  });

  it("submits immediately when all questions are answered and runs onExamEnd after confirmation", async () => {
    const onExamEnd = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockedUseExamContext.mockReturnValue({
      isExamMode: false,
      isSubmitted: false,
      setIsExamMode: jest.fn(),
      setIsSubmitted: jest.fn(),
      onExamEnd,
      setOnExamEnd: jest.fn(),
      unansweredCount: 0,
      setUnansweredCount: jest.fn(),
      totalQuestions: 10,
      setTotalQuestions: jest.fn(),
      isExplanationVisible: true,
      setIsExplanationVisible: jest.fn(),
    });

    render(<Header variant="exam" />);

    await user.click(screen.getByRole("button", { name: "시험 종료" }));

    expect(screen.getByText("시험 제출 완료")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(onExamEnd).toHaveBeenCalledTimes(1);
  });

  it("counts down and triggers the timeout flow", async () => {
    const onExamEnd = jest.fn();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    mockedUseExamContext.mockReturnValue({
      isExamMode: false,
      isSubmitted: false,
      setIsExamMode: jest.fn(),
      setIsSubmitted: jest.fn(),
      onExamEnd,
      setOnExamEnd: jest.fn(),
      unansweredCount: 0,
      setUnansweredCount: jest.fn(),
      totalQuestions: 10,
      setTotalQuestions: jest.fn(),
      isExplanationVisible: true,
      setIsExplanationVisible: jest.fn(),
    });

    render(<Header variant="exam" examDuration={1} />);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("시험 시간 종료")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(onExamEnd).toHaveBeenCalledTimes(1);
    });
  });
});
