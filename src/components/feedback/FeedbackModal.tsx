"use client";

import { useCallback, useState } from "react";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  toast,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useFeedbackMutation } from "./hooks/service";
import type { TFeedbackType } from "./interface";

const FEEDBACK_TYPE_OPTIONS: { value: TFeedbackType; label: string }[] = [
  { value: "question_bug", label: "문제 오류" },
  { value: "site_bug", label: "사이트 버그" },
  { value: "suggestion", label: "기능 제안" },
  { value: "other", label: "기타" },
];

const MAX_CONTENT_LENGTH = 5000;

interface IFeedbackModalOpenOptions {
  type?: TFeedbackType;
  questionId?: number;
  /** 사용자가 화면에서 본 문제 번호(예: "8/25"의 8, 실제 시험지의 41번 등) — 있으면 문항 ID 대신 이 번호를 보여준다 */
  questionDisplayNumber?: number;
}

/** Footer/암기모드/시험모드 진입점에서 재사용하는 피드백 모달 오픈 훅 */
export function useFeedbackModal() {
  const [state, setState] = useState<{
    open: boolean;
    type?: TFeedbackType;
    questionId?: number;
    questionDisplayNumber?: number;
  }>({ open: false });
  const requireAuth = useRequireAuth();

  const openFeedbackModal = useCallback(
    (options?: IFeedbackModalOpenOptions) => {
      requireAuth(() =>
        setState({
          open: true,
          type: options?.type,
          questionId: options?.questionId,
          questionDisplayNumber: options?.questionDisplayNumber,
        })
      );
    },
    [requireAuth]
  );

  const closeFeedbackModal = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    feedbackModalOpen: state.open,
    feedbackModalDefaultType: state.type,
    feedbackModalQuestionId: state.questionId,
    feedbackModalQuestionDisplayNumber: state.questionDisplayNumber,
    openFeedbackModal,
    closeFeedbackModal,
  };
}

interface IFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  defaultType?: TFeedbackType;
  questionId?: number;
  questionDisplayNumber?: number;
}

/**
 * Modal은 open=false일 때 children을 렌더하지 않는다(=null 반환) — 즉 아래
 * FeedbackModalBody는 열릴 때마다 새로 마운트된다. 그 덕분에 useState 초기값만으로
 * 프리필이 항상 최신 상태로 리셋되고, effect로 상태를 동기화할 필요가 없다.
 */
export const FeedbackModal = ({
  open,
  onClose,
  defaultType,
  questionId,
  questionDisplayNumber,
}: IFeedbackModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      {open && (
        <FeedbackModalBody
          onClose={onClose}
          defaultType={defaultType}
          questionId={questionId}
          questionDisplayNumber={questionDisplayNumber}
        />
      )}
    </Modal>
  );
};

interface IFeedbackModalBodyProps {
  onClose: () => void;
  defaultType?: TFeedbackType;
  questionId?: number;
  questionDisplayNumber?: number;
}

const FeedbackModalBody = ({
  onClose,
  defaultType,
  questionId,
  questionDisplayNumber,
}: IFeedbackModalBodyProps) => {
  const [type, setType] = useState<TFeedbackType | undefined>(defaultType);
  // 화면에 보여줄 문제 번호가 있으면(=특정 문제에서 진입) 내부 DB id는 숨기고
  // 그 번호만 읽기 전용으로 보여준다. 없으면(전역 피드백 진입) 직접 입력하게 둔다.
  const hasDisplayNumber = questionDisplayNumber !== undefined;
  const [questionIdInput, setQuestionIdInput] = useState(
    questionId ? String(questionId) : ""
  );
  const [pageUrlInput, setPageUrlInput] = useState(
    typeof window !== "undefined" ? window.location.href : ""
  );
  const [content, setContent] = useState("");
  const mutation = useFeedbackMutation();

  const showQuestionId = type === "question_bug";
  const showPageUrl = type === "question_bug" || type === "site_bug";

  const resetAndClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!type || content.trim().length === 0 || mutation.isPending) return;

    const resolvedQuestionId = hasDisplayNumber
      ? questionId
      : questionIdInput.trim()
        ? Number(questionIdInput.trim())
        : undefined;

    try {
      await mutation.mutateAsync({
        type,
        content: content.trim(),
        questionId:
          showQuestionId &&
          resolvedQuestionId !== undefined &&
          !Number.isNaN(resolvedQuestionId)
            ? resolvedQuestionId
            : undefined,
        pageUrl: showPageUrl
          ? pageUrlInput.trim().slice(0, 2000) || undefined
          : undefined,
      });
      // integrationStatus가 failed여도 접수(DB) 자체는 성공 — 동일 문구로 안내
      toast.success("제보가 접수되었습니다. 확인 후 반영하겠습니다.");
      resetAndClose();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          toast.error("해당 문항 정보를 찾을 수 없습니다.");
          return;
        }
        if (error.status === 401) {
          // 전역 401 핸들러(AuthContext)가 로그아웃/안내를 이미 처리
          resetAndClose();
          return;
        }
      }
      toast.error("제출에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    }
  };

  const isValid = Boolean(type) && content.trim().length > 0;

  return (
    <ModalContent size="md">
      <ModalHeader showCloseButton onClose={resetAndClose}>
        피드백
      </ModalHeader>

      <div className="flex flex-col gap-4">
        {/* 유형 선택 */}
        <div>
          <p className="mb-2 text-sm font-medium text-[#374151]">
            어떤 내용인가요?
            <span className="ml-0.5 text-destructive">*</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {FEEDBACK_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={cn(
                  "h-10 rounded-lg border text-sm font-medium transition-colors cursor-pointer",
                  type === option.value
                    ? "border-[#155DFC] bg-[#EFF6FF] text-[#155DFC]"
                    : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB]"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 문항 번호 */}
        {showQuestionId && (
          <div>
            <label
              htmlFor="feedback-question-id"
              className="mb-1.5 block text-sm font-medium text-[#374151]"
            >
              문항 번호
            </label>
            {hasDisplayNumber ? (
              <p
                id="feedback-question-id"
                className="w-full rounded-md border border-input bg-[#F9FAFB] px-3 py-2 text-sm text-[#374151]"
              >
                {questionDisplayNumber}번
              </p>
            ) : (
              <input
                id="feedback-question-id"
                type="number"
                inputMode="numeric"
                value={questionIdInput}
                onChange={(e) => setQuestionIdInput(e.target.value)}
                placeholder="해당하는 경우에만 입력해주세요"
                className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:border-[#9CA3AF]"
              />
            )}
          </div>
        )}

        {/* 관련 페이지 URL */}
        {showPageUrl && (
          <div>
            <label
              htmlFor="feedback-page-url"
              className="mb-1.5 block text-sm font-medium text-[#374151]"
            >
              관련 페이지 URL
            </label>
            <input
              id="feedback-page-url"
              type="text"
              value={pageUrlInput}
              onChange={(e) => setPageUrlInput(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:border-[#9CA3AF]"
            />
          </div>
        )}

        {/* 내용 */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="feedback-content"
              className="text-sm font-medium text-[#374151]"
            >
              내용
              <span className="ml-0.5 text-destructive">*</span>
            </label>
            <span className="text-xs text-[#9CA3AF]">
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
          </div>
          <textarea
            id="feedback-content"
            value={content}
            onChange={(e) =>
              setContent(e.target.value.slice(0, MAX_CONTENT_LENGTH))
            }
            placeholder="불편했던 점이나 제안하고 싶은 내용을 자유롭게 적어주세요."
            rows={6}
            className="w-full resize-none rounded-md border border-input px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:border-[#9CA3AF]"
          />
        </div>
      </div>

      <ModalFooter className="mt-6">
        <Button variant="outline" onClick={resetAndClose} className="flex-1">
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || mutation.isPending}
          className="flex-1"
        >
          {mutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
};
