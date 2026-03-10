import { getTutorQuestionExplanation } from "./index";

describe("memorize-mode api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("requests tutor explanation from the expected endpoint", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        explanation: "생성된 해설",
        conceptTags: ["핵심"],
        generated: true,
      }),
    });

    const result = await getTutorQuestionExplanation(101);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.qknou.kr/api/tutor/questions/101/explanation",
      {
        method: "GET",
        cache: "no-store",
      }
    );
    expect(result.explanation).toBe("생성된 해설");
    expect(result.conceptTags).toEqual(["핵심"]);
  });

  it("throws when the explanation request fails at the network layer", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(getTutorQuestionExplanation(101)).rejects.toThrow(
      "문제 해설 조회 실패"
    );
  });

  it("throws when the explanation response reports failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        explanation: "",
        generated: false,
      }),
    });

    await expect(getTutorQuestionExplanation(101)).rejects.toThrow(
      "문제 해설 생성 실패"
    );
  });
});
