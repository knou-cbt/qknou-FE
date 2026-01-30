"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Table,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Breadcrumb,
  type ColumnDef,
} from "@/shared/ui";

import {
  useExamListBySubjectQuery,
  useSubjectDetailQuery,
  type IExam,
} from "@/modules/exam";

type Props = {
  subjectId: string;
};

export const ExamYearPage = ({ subjectId }: Props) => {
  const router = useRouter();
  const [isTestModeModalOpen, setIsTestModeModalOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  // API 호출
  const { data: subjectData } = useSubjectDetailQuery(subjectId ?? "");
  const {
    data: examList,
    isLoading,
    isError,
  } = useExamListBySubjectQuery(subjectId ?? "");

  const columns = useMemo<ColumnDef<IExam, unknown>[]>(
    () => [
      {
        accessorKey: "year",
        header: "시험 년도",
        cell: ({ row }) => {
          const year = row.original.year;
          return year ? `${year}년` : "-";
        },
      },
      // {
      //   accessorKey: "title",
      //   header: "제목",
      //   cell: ({ row }) => {
      //     const title = row.original.title;
      //     return title ?? "-";
      //   },
      // },
      {
        accessorKey: "action",
        header: "기타",
        cell: ({ row }) => {
          const examId = row.original.id;
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/exam/${subjectId}/${examId}/memorize-mode`)
                }
                className="cursor-pointer"
              >
                암기모드
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedExamId(examId);
                  setIsTestModeModalOpen(true);
                }}
                className="cursor-pointer"
                variant="black"
              >
                시험모드
              </Button>
            </div>
          );
        },
      },
    ],
    [subjectId, router]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#6B7280]">시험 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">시험 목록을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center px-4 md:px-8 lg:px-16 pt-4 md:pt-4 pb-8 md:pb-12 w-full bg-gradient-to-br from-[#EFF6FF] to-white">
        {/* Breadcrumb */}
        <div className="w-full max-w-[1100px] pb-12">
          <Breadcrumb
            subject={subjectData?.name}
            subjectHref={`/exam/${subjectId}/year`}
          />
        </div>
        
        <div className="flex flex-col items-center gap-3 md:gap-4 w-full max-w-[768px]">
          <h1 className="text-lg md:text-xl lg:text-2xl font-semibold leading-7 text-center text-[#101828]">
            {subjectData?.name ?? "과목"}
          </h1>
          <p className="text-sm md:text-base leading-6 text-center text-[#4A5565]">
            풀고 싶은 시험을 선택하세요.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 pb-8  md:pt-4 md:pb-8 bg-white">
        {/* Year Table */}
        <div className="relative w-full max-w-[1100px] mx-auto">
          <Table
            data={examList ?? []}
            columns={columns}
            enablePagination={false}
          />
        </div>
      </main>

      {/* Test Mode Guidance Modal */}
      <Modal
        open={isTestModeModalOpen}
        onClose={() => setIsTestModeModalOpen(false)}
      >
        <ModalContent size="md" className="max-w-[400px]">
          <ModalHeader>안내사항</ModalHeader>
          <ModalBody className="space-y-4">
            <div className="space-y-2 text-sm leading-6 text-[#101828]">
              <p>- 시험모드는 실제 시험장과 비슷한 환경을 제공해 드려요.</p>
              <p>
                - 제한 시간이 있으며 시험을 제출하면 시험 결과와 다시 보기를
                진행할 수 있어요.
              </p>
            </div>
            <div className="pt-2">
              <p className="text-lg font-bold text-[#101828]">
                제한 시간: 150분
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="flex-col gap-2">
            <Button
              onClick={() => {
                if (selectedExamId) {
                  router.push(`/exam/${subjectId}/${selectedExamId}/test-mode`);
                }
                setIsTestModeModalOpen(false);
              }}
              variant="black"
              className="w-full"
            >
              시험 응시하기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
