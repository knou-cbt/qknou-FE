"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Table, type ColumnDef } from "../../../components/ui";
import { TableSkeleton } from "../../../components/ui/skeleton";
import { useSubjectListQuery } from "@/app/exam/[subjectId]/year/hooks/service";
import type { ISubject } from "@/app/exam/[subjectId]/year/interface";
import { InputSearch } from "@/components/search";
import { HelpCircle } from "lucide-react";


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
      {/* Hero Section with Hero Image */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#D8F1FF] via-[#D8F1FF] to-[#ECF8FF]">
        <div className="relative w-full max-w-[1100px] mx-auto  py-8 md:py-12 lg:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-12">
            {/* Left Side - Text Content */}
            <div className="flex-1 flex flex-col gap-4 md:gap-6 z-10 max-w-[700px] md:max-w-none px-4 md:px-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                <span className="text-[#155DFC]">큐노와</span>
                <br />
                <span className="text-[#111827]">같이 준비해요</span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-[#6B7280] max-w-[600px] md:max-w-[700px]">
                방송통신대학교 기출문제를 한곳에서 체계적으로 학습하세요.
              </p>
            </div>

            {/* Right Side - Icons */}
            <div className="flex-1 flex items-center justify-center relative w-full md:w-auto min-h-0 md:min-h-[16rem]">
              {/* Icon Container */}
              <div className="relative w-full max-w-[600px] h-full">
                {/* Icon 1 - Top Middle: Graduation Cap & Diploma (Hidden on mobile) */}
                <div className="hidden md:block absolute top-4 left-[45%] md:top-8 md:left-[48%] z-20 transform -translate-x-1/2">
                  <div className="relative w-20 h-20 md:w-28 md:h-28">
                    <Image
                      src="/main/main-icon-01.svg"
                      alt="졸업모와 졸업장"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Icon 2 - Top Right: Apple & Books (Hidden on mobile) */}
                <div className="hidden md:block absolute top-10 right-4 md:top-12 md:right-12 z-20">
                  <div className="relative w-20 h-20 md:w-24 md:h-24">
                    <Image
                      src="/main/main-icon-02.svg"
                      alt="칠판"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Icon 3 - Bottom Right: Backpack (Largest) */}
                <div className="absolute bottom-20 right-0 md:bottom-8 md:right-4 z-20">
                  <div className="relative w-20 h-20 md:w-36 md:h-36">
                    <Image
                      src="/main/main-icon-03.svg"
                      alt="배낭"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Icon 4 - Bottom Left: Chalkboard (Hidden on mobile) */}
                <div className="hidden md:block absolute bottom-12 left-0 md:bottom-12 md:left-8 z-20">
                  <div className="relative w-20 h-20 md:w-28 md:h-28">
                    <Image
                      src="/main/main-icon-04.svg"
                      alt="사과와 책"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Icon 5 - Middle Left: Colorful Disks (Hidden on mobile) */}
                <div className="hidden md:block absolute top-1/2 -translate-y-1/2 left-2 md:left-8 z-20">
                  <div className="relative w-16 h-16 md:w-20 md:h-20">
                    <Image
                      src="/main/main-icon-05.svg"
                      alt="학습 모듈"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Decorative Confetti Dots */}
                <div className="absolute top-16 right-16 w-2 h-2 bg-pink-400 rounded-full opacity-60"></div>
                <div className="hidden md:block absolute top-24 right-24 w-1.5 h-1.5 bg-green-400 rounded-full opacity-50"></div>
                <div className="hidden md:block absolute bottom-20 left-20 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                <div className="hidden md:block absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-40"></div>
                <div className="hidden md:block absolute top-32 right-32 w-1 h-1 bg-red-400 rounded-full opacity-50"></div>
                <div className="hidden md:block absolute bottom-32 left-32 w-1.5 h-1.5 bg-yellow-400 rounded-full opacity-40"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16 bg-white">
        {/* Section Title */}
        <div className="relative flex flex-col items-center gap-3 md:gap-4 mb-8 md:mb-12 w-full max-w-[1200px]">
          <div className="relative inline-block">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#101828]">
              문제 풀이 및 연습
            </h2>
            <Link 
              href="/about" 
              className="group absolute -top-3 -right-8 md:-top-3 md:-right-5 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 text-[#155DFC] hover:text-[#1047C8] hover:bg-[#EFF6FF] rounded-full transition-all duration-200"
              aria-label="큐노 이용 가이드"
            >
              <HelpCircle className="w-3.5 h-3.5 md:w-5 md:h-5" />
              {/* 툴팁 */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 text-xs text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                사용 방법 및 자주 묻는 질문
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></span>
              </span>
            </Link>
          </div>
          <p className="text-base md:text-lg text-center text-[#6B7280] max-w-[700px]">
            과목명을 클릭하면 연도별 기출 문제를 선택하여 풀이하고 연습할 수 있습니다.
            <br />
            흩어져 있던 방통대 기출 문제를 한 곳에서 체계적으로 학습하세요.
          </p>
        </div>

        {/* Subject Table Container */}
        <div className="relative w-full max-w-[1100px] mx-auto">
          {/* Search Input with Enhanced Styling */}
          <div className="mb-6 md:mb-8">
            <div className="relative">
              <InputSearch
                onSearch={handleSearch}
                onChange={handleSearchChange}
                placeholder="과목명으로 검색하세요"
                defaultValue={searchQuery}
              />
            </div>
          </div>

          {/* Table Card Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] overflow-hidden">
            {isLoading ? (
              <div className="p-4 md:p-6">
                <TableSkeleton columnCount={columns.length} rowCount={pagination.pageSize} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table
                  data={subjects}
                  columns={columns}
                  enablePagination
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  rowCount={data?.pagination.total}
                  onRowClick={(row) => handleClick(String(row.original.id))}
                />
              </div>
            )}
          </div>
        </div>

        {/* Call to Action Section */}
        {/* <section className="mt-12 md:mt-16 lg:mt-20 w-full max-w-[1200px] px-4 md:px-6">
          <div className="relative bg-gradient-to-br from-[#155DFC] via-[#1E6FFF] to-[#0D4FD9] rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-4 md:gap-6 text-center">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                방통대 기출 문제로 효율적으로 학습하세요
              </h3>
              <p className="text-base md:text-lg text-white/90 max-w-[600px]">
                흩어져 있던 방통대 기출 문제를 한 곳에 모아 체계적으로 학습할 수 있습니다. 
                과목별, 연도별로 정리된 문제를 통해 효율적으로 시험을 준비하세요.
              </p>
            </div>
          </div>
        </section> */}
      </main>
    </>
  );
};
