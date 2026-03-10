import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";
import { decodeToken, isTokenExpired } from "@/utils/jwt";

jest.mock("@/utils/jwt", () => ({
  decodeToken: jest.fn(),
  isTokenExpired: jest.fn(),
}));

const mockedDecodeToken = decodeToken as jest.MockedFunction<typeof decodeToken>;
const mockedIsTokenExpired = isTokenExpired as jest.MockedFunction<
  typeof isTokenExpired
>;

function AuthConsumer() {
  const { isAuthenticated, user, token, isLoading, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-loading">{String(isLoading)}</div>
      <div data-testid="auth-status">{String(isAuthenticated)}</div>
      <div data-testid="auth-user-id">{user?.id ?? "anonymous"}</div>
      <div data-testid="auth-user-name">{user?.name ?? "guest"}</div>
      <div data-testid="auth-token">{token ?? "no-token"}</div>
      <button type="button" onClick={() => login("fresh-token")}>
        login
      </button>
      <button type="button" onClick={logout}>
        logout
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockedDecodeToken.mockReset();
    mockedIsTokenExpired.mockReset();
    mockedIsTokenExpired.mockReturnValue(false);
  });

  it("restores auth state from a valid stored token", async () => {
    localStorage.setItem("qknou_auth_token", "stored-token");
    mockedDecodeToken.mockReturnValue({
      sub: "user-1",
      name: "테스터",
      email: "test@example.com",
      provider: "google",
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("auth-status")).toHaveTextContent("true");
    expect(screen.getByTestId("auth-user-id")).toHaveTextContent("user-1");
    expect(screen.getByTestId("auth-user-name")).toHaveTextContent("테스터");
    expect(screen.getByTestId("auth-token")).toHaveTextContent("stored-token");
    expect(mockedIsTokenExpired).toHaveBeenCalledWith("stored-token");
    expect(mockedDecodeToken).toHaveBeenCalledWith("stored-token");
  });

  it("removes an expired stored token during initialization", async () => {
    localStorage.setItem("qknou_auth_token", "expired-token");
    mockedIsTokenExpired.mockReturnValue(true);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("auth-status")).toHaveTextContent("false");
    expect(screen.getByTestId("auth-user-id")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("auth-token")).toHaveTextContent("no-token");
    expect(localStorage.getItem("qknou_auth_token")).toBeNull();
    expect(mockedDecodeToken).not.toHaveBeenCalled();
  });

  it("logs in with a decoded token and stores it", async () => {
    const user = userEvent.setup();
    const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    mockedDecodeToken.mockReturnValue({
      sub: "user-2",
      nickname: "로그인유저",
      email: "login@example.com",
      provider: "kakao",
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByRole("button", { name: "login" }));

    expect(screen.getByTestId("auth-status")).toHaveTextContent("true");
    expect(screen.getByTestId("auth-user-id")).toHaveTextContent("user-2");
    expect(screen.getByTestId("auth-user-name")).toHaveTextContent("로그인유저");
    expect(screen.getByTestId("auth-token")).toHaveTextContent("fresh-token");
    expect(localStorage.getItem("qknou_auth_token")).toBe("fresh-token");

    logSpy.mockRestore();
  });

  it("clears auth state and local storage on logout", async () => {
    const user = userEvent.setup();

    localStorage.setItem("qknou_auth_token", "stored-token");
    mockedDecodeToken.mockReturnValue({
      sub: "user-1",
      name: "테스터",
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("true");
    });

    await user.click(screen.getByRole("button", { name: "logout" }));

    expect(screen.getByTestId("auth-status")).toHaveTextContent("false");
    expect(screen.getByTestId("auth-user-id")).toHaveTextContent("anonymous");
    expect(screen.getByTestId("auth-token")).toHaveTextContent("no-token");
    expect(localStorage.getItem("qknou_auth_token")).toBeNull();
  });
});
