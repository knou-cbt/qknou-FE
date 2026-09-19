"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  Select,
  toast,
} from "@/components/ui";
import { EXAM_TYPE_OPTIONS } from "@/constants";
import { ApiError } from "@/lib/api-client";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { useSubjectListQuery } from "@/app/exam/[subjectId]/year/hooks/service";

import { useCheckDuplicateQuery, useUploadSubmissionMutation } from "./hooks/service";
import type { ICheckDuplicateParams } from "./interface";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const PDF_MAGIC_BYTES = "%PDF-";

const BLOCKED_REASON_LABEL: Record<string, string> = {
  already_published: "이미 등록되어 있는 시험지예요.",
  already_in_review: "이미 검수 중인 시험지예요.",
};

async function validatePdfFile(file: File): Promise<string | null> {
  if (file.type !== "application/pdf") {
    return "PDF 파일만 업로드할 수 있어요.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "파일 크기는 최대 20MB까지 가능해요.";
  }
  const headerBytes = await file.slice(0, 5).arrayBuffer();
  const header = new TextDecoder().decode(headerBytes);
  if (header !== PDF_MAGIC_BYTES) {
    return "손상되었거나 PDF 형식이 아닌 파일이에요.";
  }
  return null;
}

const MAX_EXAM_YEAR = 2019;
const MIN_EXAM_YEAR = 2013;
const YEAR_OPTIONS = Array.from(
  { length: MAX_EXAM_YEAR - MIN_EXAM_YEAR + 1 },
  (_, i) => MAX_EXAM_YEAR - i
).map((year) => ({ value: String(year), label: `${year}년` }));

/** 헤더 유저메뉴 등에서 재사용하는 시험지 등록 모달 오픈 훅 */
export function useExamSubmissionModal() {
  const [open, setOpen] = useState(false);
  const requireAuth = useRequireAuth();

  const openExamSubmissionModal = useCallback(() => {
    requireAuth(() => setOpen(true));
  }, [requireAuth]);

  const closeExamSubmissionModal = useCallback(() => setOpen(false), []);

  return {
    examSubmissionModalOpen: open,
    openExamSubmissionModal,
    closeExamSubmissionModal,
  };
}

interface IExamSubmissionModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal은 open=false일 때 children을 렌더하지 않는다 — 즉 아래 Body는 열릴 때마다
 * 새로 마운트되어 폼 상태가 항상 깨끗하게 초기화된다(effect로 리셋할 필요 없음).
 */
export const ExamSubmissionModal = ({ open, onClose }: IExamSubmissionModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      {open && <ExamSubmissionModalBody onClose={onClose} />}
    </Modal>
  );
};

const ExamSubmissionModalBody = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const requireAuth = useRequireAuth();

  const [subjectId, setSubjectId] = useState("");
  const [year, setYear] = useState("");
  const [examType, setExamType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { data: subjectsData, isLoading: isSubjectsLoading } =
    useSubjectListQuery({ limit: 500 });
  const subjectOptions = useMemo(
    () =>
      (subjectsData?.subjects ?? []).map((subject) => ({
        value: String(subject.id),
        label: subject.name,
      })),
    [subjectsData]
  );

  const checkParams: ICheckDuplicateParams | null =
    subjectId && year && examType
      ? { subjectId: Number(subjectId), year: Number(year), examType: Number(examType) }
      : null;
  const { data: duplicateCheck, isFetching: isCheckingDuplicate } =
    useCheckDuplicateQuery(checkParams);

  const uploadMutation = useUploadSubmissionMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setFileError(null);
    if (!selected) return;

    const error = await validatePdfFile(selected);
    if (error) {
      setFileError(error);
      setFile(null);
      e.target.value = "";
    }
  };

  const isBlocked = Boolean(duplicateCheck?.blocked);
  const canSubmit =
    Boolean(checkParams) &&
    Boolean(file) &&
    !fileError &&
    !isBlocked &&
    !isCheckingDuplicate &&
    !uploadMutation.isPending;

  const handleSubmit = () => {
    if (!checkParams || !file) return;

    requireAuth(async () => {
      const formData = new FormData();
      formData.append("subjectId", String(checkParams.subjectId));
      formData.append("year", String(checkParams.year));
      formData.append("examType", String(checkParams.examType));
      formData.append("file", file);

      try {
        await uploadMutation.mutateAsync(formData);
        setSubmitted(true);
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 401) return; // 전역 401 핸들러가 처리
          if (error.status === 404) {
            toast.error("아직 지원되지 않는 기능이에요. 곧 열릴 예정이에요.");
            return;
          }
          if (error.status === 400) {
            toast.error("입력값을 다시 확인해 주세요.");
            return;
          }
        }
        toast.error("업로드에 실패했어요. 잠시 후 다시 시도해 주세요.");
      }
    });
  };

  if (submitted) {
    return (
      <ModalContent size="md">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <p className="text-lg font-semibold text-[#101828]">접수됐어요!</p>
          <p className="text-sm text-[#6B7280]">
            등록해주신 시험지는 관리자가 검수 후 반영할 예정이에요.
          </p>
          <Button
            onClick={() => {
              onClose();
              router.push("/");
            }}
          >
            확인
          </Button>
        </div>
      </ModalContent>
    );
  }

  return (
    <ModalContent size="md">
      <ModalHeader showCloseButton onClose={onClose}>
        시험지 등록
      </ModalHeader>
      <p className="-mt-2 mb-4 text-sm text-[#6B7280]">
        등록해주신 시험지는 관리자가 검수 후 반영될 예정입니다.
      </p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">
            과목명
          </label>
          <Select
            options={subjectOptions}
            value={subjectId}
            onChange={setSubjectId}
            placeholder={isSubjectsLoading ? "불러오는 중..." : "과목을 선택해주세요"}
            disabled={isSubjectsLoading}
            className="h-11 text-sm"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">
            연도
          </label>
          <Select
            options={YEAR_OPTIONS}
            value={year}
            onChange={setYear}
            placeholder="연도를 선택해주세요"
            className="h-11 text-sm"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">
            시험 종류
          </label>
          <Select
            options={EXAM_TYPE_OPTIONS.map((option) => ({
              value: String(option.value),
              label: option.label,
            }))}
            value={examType}
            onChange={setExamType}
            placeholder="시험 종류를 선택해주세요"
            className="h-11 text-sm"
          />
        </div>

        {checkParams && isBlocked && duplicateCheck?.reason && (
          <p className="rounded-lg bg-[#FEF2F2] px-3 py-2 text-sm text-[#DC2626]">
            {BLOCKED_REASON_LABEL[duplicateCheck.reason] ??
              "지금은 등록할 수 없는 조합이에요."}
          </p>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#374151]">
            파일 업로드
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => void handleFileChange(e)}
            disabled={isBlocked}
            className="block w-full text-sm text-[#374151] file:mr-3 file:rounded-md file:border-0 file:bg-[#F3F4F6] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#374151] hover:file:bg-[#E5E7EB]"
          />
          {fileError ? (
            <p className="mt-1.5 text-xs text-[#DC2626]">{fileError}</p>
          ) : (
            <p className="mt-1.5 text-xs text-[#9CA3AF]">
              PDF 파일만 업로드할 수 있어요. (최대 20MB)
            </p>
          )}
        </div>
      </div>

      <ModalFooter className="mt-6">
        <Button variant="outline" onClick={onClose} className="flex-1">
          취소
        </Button>
        <Button className="flex-1" disabled={!canSubmit} onClick={handleSubmit}>
          {uploadMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </ModalFooter>
    </ModalContent>
  );
};
