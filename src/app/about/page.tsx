"use client";

import React from "react";

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

export default function AboutPage() {
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
      <div className="min-h-screen bg-white">
        <main className="flex-1 flex flex-col items-center px-4 md:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
          {/* Page Header */}
          <div className="flex flex-col items-center gap-3 md:gap-4 mb-8 md:mb-12 w-full max-w-[1200px]">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-[#101828]">
              큐노 사용 가이드
            </h1>
            <p className="text-base md:text-lg text-center text-[#6B7280] max-w-[700px]">
              방송통신대학교 기출문제를 효율적으로 학습하는 방법을 안내합니다.
            </p>
          </div>

          {/* GEO 4.1: 명확한 주제·구조화 — 사용 방법 (H2/H3) */}
          <section className="w-full max-w-[1100px] mx-auto mt-12 md:mt-16" aria-labelledby="usage-heading">
            <h2 id="usage-heading" className="text-xl md:text-2xl font-bold text-[#101828] mb-4">
              사용 방법
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-[#4A5565] text-sm md:text-base">
              <li>
                <h3 className="inline font-semibold text-[#101828]">과목 선택</h3> — 홈 화면의 표에서 과목명을 클릭하면 해당 과목의 연도별 시험지 목록으로 이동합니다.
              </li>
              <li>
                <h3 className="inline font-semibold text-[#101828]">연도·모드 선택</h3> — 원하는 연도를 선택한 뒤, 암기 모드(정답·해설 확인) 또는 시험 모드(실전 연습)를 선택합니다.
              </li>
              <li>
                <h3 className="inline font-semibold text-[#101828]">문제 풀이</h3> — 암기 모드는 문제별로 정답 확인이 가능하고, 시험 모드는 제한 시간 내 제출 후 결과를 확인할 수 있습니다.
              </li>
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
          <section className="w-full max-w-[1100px] mx-auto mt-12 md:mt-16 mb-8 text-center">
            <p className="mt-3 text-[#6B7280] text-xs md:text-sm">
              <a
                href="https://www.qknou.kr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#155DFC] hover:underline"
              >
                홈 화면
              </a>
              에서 과목 선택으로 연도별 기출을 풀어보세요.
            </p>
          </section>
        </main>
      </div>
    </>
  );
}

