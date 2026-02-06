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

/** GEO: FAQ 형식 콘텐츠 — AI 추출·인용에 적합 */
const FAQ_ITEMS = [
  {
    question: "방송통신대학교 기출문제는 어떻게 풀 수 있나요?",
    answer:
      "큐노에서 과목을 선택한 뒤, 연도별 시험지를 고르면 됩니다. 암기 모드로 정답과 해설을 보며 학습하거나, 시험 모드로 제한 시간 안에 실전처럼 풀 수 있습니다.",
  },
  {
    question: "암기 모드와 시험 모드의 차이는 무엇인가요?",
    answer:
      "암기 모드는 문제를 풀고 바로 정답과 해설을 확인할 수 있어 복습에 적합합니다. 시험 모드는 150분 제한 시간이 있으며, 제출 후에만 결과와 정답을 확인할 수 있어 실전 연습에 적합합니다.",
  },
  {
    question: "과목별·연도별 기출문제를 한곳에서 볼 수 있나요?",
    answer:
      "네. 큐노는 방통대 기출문제를 과목·연도별로 정리해 제공합니다. 과목명으로 검색한 뒤 원하는 연도의 시험지를 선택하면 됩니다.",
  },
  {
    question: "기출문제 출처는 어디인가요?",
    answer:
      "기출문제의 출제·저작권은 방송통신대학교(KNOU)에 있으며, 큐노는 학습 목적으로 정리·제공합니다. 자세한 사항은 방송통신대학교 공식 사이트를 참고해 주세요.",
  },
] as const;

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

  /** GEO 4.5: FAQPage 스키마 — AI가 콘텐츠 이해·인용에 활용 */
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
        <div className="flex flex-col items-center gap-3 md:gap-4 mb-8 md:mb-12 w-full max-w-[1200px]">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#101828]">
            문제 풀이 및 연습
          </h2>
          <p className="text-base md:text-lg text-center text-[#6B7280] max-w-[700px]">
            과목명을 클릭하면 연도별 기출 문제를 선택하여 풀이하고 연습할 수 있습니다.
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

        {/* GEO 4.1: 명확한 주제·구조화 — 사용 방법 (H2/H3) */}
        <section className="w-full max-w-[1100px] mx-auto mt-12 md:mt-16" aria-labelledby="usage-heading">
          <h2 id="usage-heading" className="text-xl md:text-2xl font-bold text-[#101828] mb-4">
            사용 방법
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-[#4A5565] text-sm md:text-base">
            <li><h3 className="inline font-semibold text-[#101828]">과목 선택</h3> — 위 표에서 과목명을 클릭하면 해당 과목의 연도별 시험지 목록으로 이동합니다.</li>
            <li><h3 className="inline font-semibold text-[#101828]">연도·모드 선택</h3> — 원하는 연도를 선택한 뒤, 암기 모드(정답·해설 확인) 또는 시험 모드(실전 연습)를 선택합니다.</li>
            <li><h3 className="inline font-semibold text-[#101828]">문제 풀이</h3> — 암기 모드는 문제별로 정답 확인이 가능하고, 시험 모드는 제한 시간 내 제출 후 결과를 확인할 수 있습니다.</li>
          </ol>
        </section>

        {/* GEO 4.2: FAQ 형식 — AI 추출·인용에 적합 */}
        <section className="w-full max-w-[1100px] mx-auto mt-12 md:mt-16" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-xl md:text-2xl font-bold text-[#101828] mb-6">
            자주 묻는 질문
          </h2>
          <ul className="space-y-6">
            {FAQ_ITEMS.map((item, index) => (
              <li key={index}>
                <h3 className="font-semibold text-[#101828] text-base md:text-lg mb-2">
                  {item.question}
                </h3>
                <p className="text-[#4A5565] text-sm md:text-base leading-relaxed">
                  {item.answer}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* GEO 4.3·4.4: 신뢰할 수 있는 출처·E-E-A-T */}
        <section className="w-full max-w-[1100px] mx-auto mt-8 mb-8 text-center">
          <p className="text-[#6B7280] text-xs md:text-sm">
            기출문제 출제·저작권은{" "}
            <a
              href="https://www.knou.ac.kr"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-[#155DFC] hover:underline"
            >
              방송통신대학교(KNOU)
            </a>
            에 있으며, 큐노는 학습 목적으로 정리·제공합니다.
          </p>
          <p className="mt-3 text-[#6B7280] text-xs md:text-sm">
            <Link href="/" className="text-[#155DFC] hover:underline">홈으로</Link>
            {" · "}
            <span className="text-[#101828]">위 표에서 과목 선택</span>으로 연도별 기출을 풀어보세요.
          </p>
        </section>

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
