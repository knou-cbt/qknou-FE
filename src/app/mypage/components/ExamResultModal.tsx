"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { cn } from "@/lib/utils";

import { useExamHistoryDetailQuery } from "../hooks/service";
import { EXAM_TYPE_LABEL } from "../interface";

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

interface IExamResultModalProps {
  /** null이면 모달을 닫힌 상태로 렌더 */
  attemptId: number | null;
  onClose: () => void;
}

/** 마이페이지 "내가 풀었던 문제" 카드의 "결과 보기" — 문항별 정오표를 보여준다 */
export const ExamResultModal = ({ attemptId, onClose }: IExamResultModalProps) => {
  const open = attemptId !== null;
  const { data, isLoading } = useExamHistoryDetailQuery(attemptId);

  return (
    <Modal open={open} onClose={onClose}>
      {open && (
        <ModalContent size="lg">
          <ModalHeader showCloseButton onClose={onClose}>
            결과 보기
          </ModalHeader>

          {isLoading || !data ? (
            <p className="py-10 text-center text-sm text-[#6B7280]">
              불러오는 중...
            </p>
          ) : (
            <>
              <p className="-mt-1 mb-4 text-sm text-[#6B7280]">
                {data.subjectName} · {data.year}년 ·{" "}
                {EXAM_TYPE_LABEL[data.examType] ?? ""} · 제출일{" "}
                {formatDate(data.submittedAt)}
              </p>
              <p className="mb-3 text-sm font-semibold text-[#101828]">
                정오표 (정답 {data.correctCount} · 오답 {data.wrongCount})
              </p>

              <div className="max-h-[60vh] overflow-y-auto">
                <TableRoot className="w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-white text-sm">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-14">번호</TableHead>
                      <TableHead>지문</TableHead>
                      <TableHead className="w-20">내 답</TableHead>
                      <TableHead className="w-20">정답</TableHead>
                      <TableHead className="w-16 text-center">정오</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.answers.map((answer) => (
                      <TableRow key={answer.questionId}>
                        <TableCell className="text-[#6B7280]">
                          {answer.questionNumber}
                        </TableCell>
                        <TableCell className="max-w-0 truncate">
                          {answer.questionText}
                        </TableCell>
                        <TableCell>
                          {answer.userAnswer === null ? (
                            <span className="text-[#9CA3AF]">미선택</span>
                          ) : (
                            answer.userAnswer
                          )}
                        </TableCell>
                        <TableCell>{answer.correctAnswers.join(", ")}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                              answer.isCorrect
                                ? "bg-[#DCFCE7] text-[#22C55E]"
                                : "bg-[#FEE2E2] text-[#EF4444]"
                            )}
                          >
                            {answer.isCorrect ? "O" : "X"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            </>
          )}
        </ModalContent>
      )}
    </Modal>
  );
};
