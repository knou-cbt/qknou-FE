"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Table, type ColumnDef } from "../../../components/ui";
import { TableSkeleton } from "../../../components/ui/skeleton";
import { useSubjectListQuery } from "@/app/exam/[subjectId]/year/hooks/service";
import type { ISubject } from "@/app/exam/[subjectId]/year/interface";
import { InputSearch } from "@/components/search";

export const MainContainer = () => {
  const router = useRouter();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState("");

  // API 호출
  const { data, isLoading, isError } = useSubjectListQuery({
    search: searchQuery || undefined,
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });
  const subjects = data?.subjects ?? [];

  const handleClick = (subjectId: string) => {
    router.push(`/exam/${subjectId}/year`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // 검색 시 첫 페이지로 리셋
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // 검색어가 비어있으면 첫 페이지로 리셋
    if (!value.trim()) {
      setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
    }
  };

  const columns = useMemo<ColumnDef<ISubject, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "번호",
        enableSorting: false,
        cell: ({ row }) => {
          const index = pagination.pageIndex * pagination.pageSize + row.index + 1;
          return index;
        },
      },
      {
        accessorKey: "name",
        header: "과목명",
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  );

  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col items-center px-4 md:px-8 lg:px-16 pt-16 md:pt-24 pb-8 md:pb-12 w-full bg-gradient-to-br from-[#EFF6FF] to-white">
        <div className="flex flex-col items-center gap-3 md:gap-4 w-full max-w-[768px]">
          {/* Heading */}
          <h1 className="text-xl md:text-2xl font-bold leading-7 text-center text-[#0F172A]">
            오늘도 큐노와 함께
          </h1>

          {/* Subtitle */}
          <p className="text-sm md:text-base font-semibold leading-6 text-center text-[#1E293B]">
            틀린 문제 위주로, 필요한 것만 정확하게 복습하세요.
          </p>
        </div>
      </section>

      {/* Main Content - Preview Section */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 md:py-12 bg-white">
        {/* Preview Title */}
        <div className="flex flex-col items-center gap-2 mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-center text-[#101828]">
            문제 풀이 및 연습
          </h2>
          <p className="text-sm md:text-base text-center text-[#6B7280]">
            과목명을 클릭하면 연도별 문제를 선택하여 풀이하고 연습할 수 있습니다.
          </p>
        </div>

        {/* Subject Table */}
        <div className="relative w-full max-w-[1100px] mx-auto">
          {/* Search Input */}
          <div className="mb-6">
            <InputSearch
              onSearch={handleSearch}
              onChange={handleSearchChange}
              placeholder="과목명으로 검색하세요"
              defaultValue={searchQuery}
            />
          </div>

          {isLoading ? (
            <TableSkeleton columnCount={columns.length} rowCount={pagination.pageSize} />
          ) : (
            <Table
              data={subjects}
              columns={columns}
              enablePagination
              pagination={pagination}
              onPaginationChange={setPagination}
              rowCount={data?.pagination.total}
              onRowClick={(row) => handleClick(String(row.original.id))}
            />
          )}
        </div>
      </main>
    </>
  );
};
