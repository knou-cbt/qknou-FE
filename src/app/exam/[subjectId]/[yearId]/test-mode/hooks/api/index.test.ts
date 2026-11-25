import {
  getExamQuestions,
  getExamQuestionsWithAnswers,
  postExamSubmit,
} from "./index";
import { ExamApiPaths } from "@/constants";
import { ApiError } from "@/lib/api-client";

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
      ExamApiPaths.questions("2025", "test"),
      expect.objectContaining({ headers: {} })
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

    // 비로그인: 목록만 요청하고 정답 API는 부르지 않는다
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      ExamApiPaths.questions("2025", "study"),
      expect.objectContaining({ headers: {} })
    );
    expect(result.questions[0].correctAnswers).toEqual([]);
  });

  it("merges answers from the answers API when logged in", async () => {
    localStorage.setItem("qknou_auth_token", "token-1");
    (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
      if (url === ExamApiPaths.answers("2025")) {
        return {
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                examId: 2025,
                answers: [{ questionId: 10, number: 1, correctAnswers: [3] }],
              },
            }),
        };
      }
      return {
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
      };
    });

    try {
      const result = await getExamQuestionsWithAnswers("2025");

      expect(global.fetch).toHaveBeenCalledWith(
        ExamApiPaths.questions("2025", "study"),
        expect.objectContaining({
          headers: { Authorization: "Bearer token-1" },
        })
      );
      expect(result.questions[0].correctAnswers).toEqual([3]);
    } finally {
      localStorage.removeItem("qknou_auth_token");
    }
  });

  it("posts exam answers and normalizes missing result correct answers", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
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
      ExamApiPaths.submit("2025"),
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
      status: 400,
      json: async () => undefined,
    });

    await expect(postExamSubmit("2025", { answers: [] })).rejects.toThrow(
      ApiError
    );
  });
});
