/**
 * Mock for @/modules/exam (exam hooks, context, types)
 * Used by TestModePage and MemorizeModePage unit/integration tests.
 */

export const mockExamData = {
  exam: {
    id: 1,
    subject: "수학",
    title: "Mock Exam",
    totalQuestions: 2,
    year: 2023,
  },
  questions: [
    {
      id: 1,
      number: 1,
      text: "1+1=?",
      choices: [
        { id: 1, number: 1, text: "1" },
        { id: 2, number: 2, text: "2" },
      ],
      correctAnswers: [2],
      explanation: "1+1은 2입니다.",
    },
    {
      id: 2,
      number: 2,
      text: "2+2=?",
      choices: [
        { id: 3, number: 1, text: "3" },
        { id: 4, number: 2, text: "4" },
      ],
      correctAnswers: [2],
      explanation: "2+2는 4입니다.",
    },
  ],
};

export const useExamContext = jest.fn(() => ({
  setOnExamEnd: jest.fn(),
  setUnansweredCount: jest.fn(),
  setTotalQuestions: jest.fn(),
  setIsSubmitted: jest.fn(),
}));

export const useExamQuestionsQuery = jest.fn(() => ({
  data: mockExamData,
  isLoading: false,
  isError: false,
}));

export const useExamQuestionsWithAnswersQuery = jest.fn(() => ({
  data: mockExamData,
  isLoading: false,
  isError: false,
}));

export const useExamSubmitMutation = jest.fn(() => ({
  mutateAsync: jest.fn().mockResolvedValue({
    examId: "2023",
    totalQuestions: 2,
    correctCount: 1,
    score: 50,
    results: [
      {
        questionId: 1,
        isCorrect: true,
        selectedAnswer: 2,
        correctAnswers: [2],
      },
      {
        questionId: 2,
        isCorrect: false,
        selectedAnswer: 1,
        correctAnswers: [2],
      },
    ],
  }),
}));
