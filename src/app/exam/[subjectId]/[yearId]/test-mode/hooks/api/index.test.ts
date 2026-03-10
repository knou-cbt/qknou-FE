import {
  getExamQuestions,
  getExamQuestionsWithAnswers,
  postExamSubmit,
} from "./index";

describe("test-mode api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("requests test-mode questions from the expected endpoint", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          exam: {
            id: 1,
            subject: "교육학",
            title: "2025",
            totalQuestions: 1,
            year: 2025,
          },
          questions: [
            {
              id: 10,
              number: 1,
              text: "문제",
              choices: [{ id: 1, number: 1, text: "보기" }],
            },
          ],
        },
      }),
    });

    const result = await getExamQuestions("2025");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.qknou.kr/api/exams/2025/questions?mode=test"
    );
    expect(result.questions[0].text).toBe("문제");
  });

  it("fills missing correct answers with an empty array in study mode", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          exam: {
            id: 1,
            subject: "교육학",
            title: "2025",
            totalQuestions: 1,
            year: 2025,
          },
          questions: [
            {
              id: 10,
              number: 1,
              text: "문제",
              choices: [{ id: 1, number: 1, text: "보기" }],
            },
          ],
        },
      }),
    });

    const result = await getExamQuestionsWithAnswers("2025");

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.qknou.kr/api/exams/2025/questions?mode=study"
    );
    expect(result.questions[0].correctAnswers).toEqual([]);
  });

  it("posts exam answers and normalizes missing result correct answers", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          examId: "2025",
          totalQuestions: 2,
          correctCount: 1,
          score: 50,
          results: [
            {
              questionId: 10,
              selectedAnswer: 2,
              isCorrect: true,
            },
          ],
        },
      }),
    });

    const payload = {
      answers: [{ questionId: 10, selectedAnswer: 2 }],
    };
    const result = await postExamSubmit("2025", payload);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.qknou.kr/api/exams/2025/submit",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    expect(result.results[0].correctAnswers).toEqual([]);
  });

  it("throws when question loading fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(getExamQuestions("2025")).rejects.toThrow("시험 문제 조회 실패");
  });

  it("throws when exam submit fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(
      postExamSubmit("2025", { answers: [] })
    ).rejects.toThrow("시험 제출 실패");
  });
});

