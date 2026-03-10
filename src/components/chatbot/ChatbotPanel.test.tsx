import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatbotPanel } from "./ChatbotPanel";

const pushMock = jest.fn();
const useAuthMock = jest.fn();

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: { alt?: string; fill?: boolean } & Record<string, unknown>) => {
    const { alt, fill, ...rest } = props;
    void fill;
    return <img {...rest} alt={alt ?? ""} />;
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

jest.mock("remark-gfm", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/contexts", () => ({
  useAuth: () => useAuthMock(),
}));

describe("ChatbotPanel", () => {
  const advanceTypingAnimation = async (ms: number) => {
    await act(async () => {
      jest.advanceTimersByTime(ms);
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
    useAuthMock.mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("renders the chatbot panel for guests with login guidance", () => {
    render(<ChatbotPanel open onClose={jest.fn()} />);

    expect(screen.getByRole("dialog", { name: "챗봇" })).toBeInTheDocument();
    expect(screen.getAllByText("AI 학습 도우미")).toHaveLength(2);
    expect(
      screen.getByPlaceholderText("로그인 사용자만 이용 가능합니다.")
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "로그인 하러 가기" })).toBeInTheDocument();
  });

  it("navigates to login when the guest clicks the login CTA", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<ChatbotPanel open onClose={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "로그인 하러 가기" }));

    expect(pushMock).toHaveBeenCalledWith("/auth/login");
  });

  it("sends a suggested question and renders the bot reply for logged-in users", async () => {
    useAuthMock.mockReturnValue({
      user: { id: "user-1", name: "Tester", email: "test@example.com" },
      token: "token",
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: "테스트 응답입니다.",
      }),
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<ChatbotPanel open onClose={jest.fn()} />);

    await user.click(
      screen.getByRole("button", { name: "학습 도우미는 무엇인가요?" })
    );

    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByText("학습 도우미는 무엇인가요?")).toBeInTheDocument();

    await advanceTypingAnimation(15000);

    await waitFor(() => {
      expect(screen.getByText("학습 도우미란?", { exact: false })).toBeInTheDocument();
    });
  });

  it("submits typed input to the chatbot API and renders the response", async () => {
    useAuthMock.mockReturnValue({
      user: { id: "user-1", name: "Tester", email: "test@example.com" },
      token: "token",
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        reply: "응답 완료",
      }),
    });

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<ChatbotPanel open onClose={jest.fn()} />);

    await user.type(screen.getByRole("textbox", { name: "메시지 입력" }), "테스트 질문");
    await user.click(screen.getByRole("button", { name: "보내기" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/chatbot",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    await advanceTypingAnimation(1000);

    await waitFor(() => {
      expect(screen.getByText("응답 완료")).toBeInTheDocument();
    });
  });
});
