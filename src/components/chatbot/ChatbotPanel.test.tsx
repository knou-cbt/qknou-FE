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

// 답변 AI 드롭다운은 React Query가 필요해 별도로 다루고, 패널 테스트에서는 비운다
jest.mock("./ChatbotAiSelector", () => ({
  ChatbotAiSelector: () => null,
}));

const useAiConnectionsQueryMock = jest.fn();
jest.mock("@/app/mypage/hooks/service", () => ({
  useAiConnectionsQuery: () => useAiConnectionsQueryMock(),
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
    useAiConnectionsQueryMock.mockReturnValue({ data: undefined });
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

  describe("with a question context", () => {
    const loggedInAuth = {
      user: { id: "user-1", name: "Tester", email: "test@example.com" },
      token: "token",
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    };

    const mockTutorFetch = (chatResponse: { ok: boolean; status?: number; body: unknown }) => {
      (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
        if (url === "/api/tutor/remaining-count") {
          return {
            ok: true,
            json: async () => ({ success: true, remainingCount: 0, totalLimit: 5 }),
          };
        }
        return {
          ok: chatResponse.ok,
          status: chatResponse.status ?? 200,
          json: async () => chatResponse.body,
        };
      });
    };

    beforeEach(() => {
      useAuthMock.mockReturnValue(loggedInAuth);
    });

    it("blocks questions when the default AI quota is used up", async () => {
      useAiConnectionsQueryMock.mockReturnValue({
        data: { activeProvider: null, connections: [] },
      });
      mockTutorFetch({ ok: true, body: { success: true } });

      render(<ChatbotPanel open onClose={jest.fn()} questionId={1} />);

      await waitFor(() => {
        expect(screen.getByRole("textbox", { name: "메시지 입력" })).toBeDisabled();
      });
    });

    it("ignores the quota when the user's own AI is active", async () => {
      useAiConnectionsQueryMock.mockReturnValue({
        data: {
          activeProvider: "gemini",
          connections: [{ provider: "gemini", maskedKey: "AI...1234", connectedAt: "" }],
        },
      });
      mockTutorFetch({
        ok: true,
        body: { success: true, data: { answer: "내 AI 응답", intent: "general" }, remainingCount: 0 },
      });
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<ChatbotPanel open onClose={jest.fn()} questionId={1} />);

      expect(screen.getByText(/횟수 제한 없음/)).toBeInTheDocument();
      await user.type(screen.getByRole("textbox", { name: "메시지 입력" }), "질문");
      await user.click(screen.getByRole("button", { name: "보내기" }));
      await advanceTypingAnimation(1000);

      await waitFor(() => {
        expect(screen.getByText("내 AI 응답")).toBeInTheDocument();
      });
      expect(screen.getByRole("textbox", { name: "메시지 입력" })).toBeEnabled();
    });

    it("does not fall back to the operator chatbot when the user's own AI fails", async () => {
      useAiConnectionsQueryMock.mockReturnValue({
        data: {
          activeProvider: "gemini",
          connections: [{ provider: "gemini", maskedKey: "AI...1234", connectedAt: "" }],
        },
      });
      mockTutorFetch({ ok: false, status: 409, body: { success: false, code: "AI_KEY_INVALID" } });
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      render(<ChatbotPanel open onClose={jest.fn()} questionId={1} />);

      await user.type(screen.getByRole("textbox", { name: "메시지 입력" }), "질문");
      await user.click(screen.getByRole("button", { name: "보내기" }));
      await advanceTypingAnimation(5000);

      await waitFor(() => {
        expect(screen.getByText(/다시 연결해 주세요/)).toBeInTheDocument();
      });
      expect(global.fetch).not.toHaveBeenCalledWith("/api/chatbot", expect.anything());
    });
  });
});
