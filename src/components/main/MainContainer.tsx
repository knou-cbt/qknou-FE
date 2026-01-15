"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Table, type ColumnDef } from "../ui";
import { useSubjectListQuery } from "@/app/exam/[subjectId]/year/hooks/service";
import type { ISubject } from "@/app/exam/[subjectId]/year/interface";

export const MainContainer = () => {
  const router = useRouter();

  // API 호출
  const { data, isLoading, isError } = useSubjectListQuery();
  const subjects = data?.subjects ?? [];

  const handleClick = (subjectId: string) => {
    router.push(`/exam/${subjectId}/year`);
  };

  const columns = useMemo<ColumnDef<ISubject, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "번호",
        enableSorting: false,
        cell: ({ row }) => {
          const index = row.index + 1;
          return index;
        },
      },
      {
        accessorKey: "name",
        header: "과목명",
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#6B7280]">과목 목록을 불러오는 중...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">과목 목록을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center px-4 md:px-8 lg:px-16 pt-16 md:pt-24 pb-8 md:pb-12 w-full bg-gradient-to-br from-[#EFF6FF] to-white">
        <div className="flex flex-col items-center gap-3 md:gap-4 w-full max-w-[768px]">
          {/* Heading */}
          <h1 className="text-lg md:text-xl lg:text-2xl font-semibold leading-7 text-center text-[#101828]">
            오늘도 문제 다모아와 함께
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base leading-6 text-center text-[#4A5565]">
            틀린 문제 위주로, 필요한 것만 정확하게 복습하세요.
          </p>
        </div>
      </section>

      {/* Main Content - Preview Section */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-12 bg-white">
        {/* Preview Title */}
        <div className="flex flex-col items-center gap-2 mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-[#101828]">
            간편한 문제 관리
          </h2>
          <p className="text-sm md:text-base text-[#6B7280]">
            직관적인 인터페이스로 문제를 쉽게 관리하세요
          </p>
        </div>

        {/* Subject Table */}
        <div className="relative w-full max-w-[1100px] mx-auto">
          <Table
            data={subjects}
            columns={columns}
            enablePagination={false}
            onRowClick={(row) => handleClick(String(row.original.id))}
          />
        </div>
      </main>
    </>
  );
};
