import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExamProvider, useExamContext } from "./ExamContext";

function ExamConsumer() {
  const {
    isExamMode,
    isSubmitted,
    setIsExamMode,
    setIsSubmitted,
    onExamEnd,
    setOnExamEnd,
    unansweredCount,
    setUnansweredCount,
    totalQuestions,
    setTotalQuestions,
    isExplanationVisible,
    setIsExplanationVisible,
  } = useExamContext();

  return (
    <div>
      <div data-testid="is-exam-mode">{String(isExamMode)}</div>
      <div data-testid="is-submitted">{String(isSubmitted)}</div>
      <div data-testid="unanswered-count">{String(unansweredCount)}</div>
      <div data-testid="total-questions">{String(totalQuestions)}</div>
      <div data-testid="is-explanation-visible">
        {String(isExplanationVisible)}
      </div>

      <button type="button" onClick={() => setIsExamMode(true)}>
        set exam mode
      </button>
      <button type="button" onClick={() => setIsSubmitted(true)}>
        set submitted
      </button>
      <button type="button" onClick={() => setUnansweredCount(3)}>
        set unanswered
      </button>
      <button type="button" onClick={() => setTotalQuestions(20)}>
        set total
      </button>
      <button
        type="button"
        onClick={() => setIsExplanationVisible((prev) => !prev)}
      >
        toggle explanation
      </button>
      <button
        type="button"
        onClick={() => setOnExamEnd(examEndHandler)}
      >
        register exam end
      </button>
      <button type="button" onClick={onExamEnd}>
        run exam end
      </button>
      <button type="button" onClick={() => setOnExamEnd(null)}>
        clear exam end
      </button>
    </div>
  );
}

const examEndHandler = jest.fn();

describe("ExamContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when used outside the provider", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const OrphanConsumer = () => {
      useExamContext();
      return null;
    };

    expect(() => render(<OrphanConsumer />)).toThrow(
      "useExamContext must be used within ExamProvider"
    );

    errorSpy.mockRestore();
  });

  it("provides the expected default state", () => {
    render(
      <ExamProvider>
        <ExamConsumer />
      </ExamProvider>
    );

    expect(screen.getByTestId("is-exam-mode")).toHaveTextContent("false");
    expect(screen.getByTestId("is-submitted")).toHaveTextContent("false");
    expect(screen.getByTestId("unanswered-count")).toHaveTextContent("0");
    expect(screen.getByTestId("total-questions")).toHaveTextContent("0");
    expect(screen.getByTestId("is-explanation-visible")).toHaveTextContent(
      "true"
    );
  });

  it("updates exam state values through the exposed setters", async () => {
    const user = userEvent.setup();

    render(
      <ExamProvider>
        <ExamConsumer />
      </ExamProvider>
    );

    await user.click(screen.getByRole("button", { name: "set exam mode" }));
    await user.click(screen.getByRole("button", { name: "set submitted" }));
    await user.click(screen.getByRole("button", { name: "set unanswered" }));
    await user.click(screen.getByRole("button", { name: "set total" }));
    await user.click(
      screen.getByRole("button", { name: "toggle explanation" })
    );

    expect(screen.getByTestId("is-exam-mode")).toHaveTextContent("true");
    expect(screen.getByTestId("is-submitted")).toHaveTextContent("true");
    expect(screen.getByTestId("unanswered-count")).toHaveTextContent("3");
    expect(screen.getByTestId("total-questions")).toHaveTextContent("20");
    expect(screen.getByTestId("is-explanation-visible")).toHaveTextContent(
      "false"
    );
  });

  it("registers and runs the latest exam end handler", async () => {
    const user = userEvent.setup();

    render(
      <ExamProvider>
        <ExamConsumer />
      </ExamProvider>
    );

    await user.click(screen.getByRole("button", { name: "register exam end" }));
    await user.click(screen.getByRole("button", { name: "run exam end" }));

    expect(examEndHandler).toHaveBeenCalledTimes(1);
  });

  it("does not call a cleared exam end handler", async () => {
    const user = userEvent.setup();

    render(
      <ExamProvider>
        <ExamConsumer />
      </ExamProvider>
    );

    await user.click(screen.getByRole("button", { name: "register exam end" }));
    await user.click(screen.getByRole("button", { name: "clear exam end" }));
    await user.click(screen.getByRole("button", { name: "run exam end" }));

    expect(examEndHandler).not.toHaveBeenCalled();
  });
});
