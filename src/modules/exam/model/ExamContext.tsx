"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

interface IExamContextValue {
  isExamMode: boolean;
  isSubmitted: boolean;
  setIsExamMode: (value: boolean) => void;
  setIsSubmitted: (value: boolean) => void;
  onExamEnd: () => void;
  setOnExamEnd: (handler: (() => void) | null) => void;
  // 풀지 않은 문제 개수
  unansweredCount: number;
  setUnansweredCount: (count: number) => void;
  totalQuestions: number;
  setTotalQuestions: (count: number) => void;
}

const ExamContext = createContext<IExamContextValue | null>(null);

export const ExamProvider = ({ children }: { children: ReactNode }) => {
  const [isExamMode, setIsExamMode] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // ref로 관리하여 리렌더링 방지
  const onExamEndRef = useRef<(() => void) | null>(null);

  const handleSetOnExamEnd = useCallback((handler: (() => void) | null) => {
    onExamEndRef.current = handler;
  }, []);

  const handleOnExamEnd = useCallback(() => {
    onExamEndRef.current?.();
  }, []);

  return (
    <ExamContext.Provider
      value={{
        isExamMode,
        isSubmitted,
        setIsExamMode,
        setIsSubmitted,
        onExamEnd: handleOnExamEnd,
        setOnExamEnd: handleSetOnExamEnd,
        unansweredCount,
        setUnansweredCount,
        totalQuestions,
        setTotalQuestions,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExamContext = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error("useExamContext must be used within ExamProvider");
  }
  return context;
};
