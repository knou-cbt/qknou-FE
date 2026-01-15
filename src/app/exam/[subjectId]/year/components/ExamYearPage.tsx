"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Table, type ColumnDef } from "@/components/ui";

import {
  useExamListBySubjectQuery,
  useSubjectDetailQuery,
} from "../hooks/service";
import type { IExam } from "../interface";

type Props = {
  subjectId: string;
};

export const ExamYearPage = ({ subjectId }: Props) => {
  const router = useRouter();

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
      {
        accessorKey: "title",
        header: "제목",
        cell: ({ row }) => {
          const title = row.original.title;
          return title ?? "-";
        },
      },
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
                onClick={() =>
                  router.push(`/exam/${subjectId}/${examId}/test-mode`)
                }
                className="cursor-pointer"
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
      <section className="flex flex-col items-center px-4 md:px-8 lg:px-16 pt-16 md:pt-24 pb-8 md:pb-12 w-full bg-gradient-to-br from-[#EFF6FF] to-white">
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
      <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-12 bg-white">
        <div className="flex flex-col items-center gap-2 mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-[#101828]">
            연도별 시험 문제
          </h2>
        </div>

        {/* Year Table */}
        <div className="relative w-full max-w-[1100px] mx-auto">
          <Table
            data={examList ?? []}
            columns={columns}
            enablePagination={false}
          />
        </div>
      </main>
    </>
  );
};
