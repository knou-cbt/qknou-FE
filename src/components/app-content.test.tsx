import { render, screen } from "@testing-library/react";
import { AppContent } from "./app-content";
import { usePathname } from "next/navigation";
import { useExamContext } from "@/contexts";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

jest.mock("@/contexts", () => ({
  useExamContext: jest.fn(),
}));

jest.mock("@/components", () => ({
  Header: ({ variant }: { variant: "default" | "exam" }) => (
    <div data-testid="header">{variant}</div>
  ),
  Footer: () => <div data-testid="footer">footer</div>,
  KakaoAd: () => <div data-testid="kakao-ad">ad</div>,
}));

const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockedUseExamContext = useExamContext as jest.MockedFunction<
  typeof useExamContext
>;

describe("AppContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  });

  it("renders the exam header on a test-mode route before submission", () => {
    mockedUsePathname.mockReturnValue("/exam/subject/2025/test-mode");

    render(<AppContent>content</AppContent>);

    expect(screen.getByTestId("header")).toHaveTextContent("exam");
    expect(screen.getByText("content")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("kakao-ad")).toBeInTheDocument();
  });

  it("falls back to the default header after submission", () => {
    mockedUsePathname.mockReturnValue("/exam/subject/2025/test-mode");
    mockedUseExamContext.mockReturnValue({
      isExamMode: false,
      isSubmitted: true,
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

    render(<AppContent>content</AppContent>);

    expect(screen.getByTestId("header")).toHaveTextContent("default");
  });

  it("hides the header on the auth success page", () => {
    mockedUsePathname.mockReturnValue("/auth/success");

    render(<AppContent>content</AppContent>);

    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("kakao-ad")).toBeInTheDocument();
  });
});

