"use client";

import React from "react";
import Link from "next/link";

const SECTIONS = [
  { id: "purpose", title: "제1조 (목적)" },
  { id: "definitions", title: "제2조 (정의)" },
  { id: "notice", title: "제3조 (약관의 게시와 개정)" },
  { id: "provision", title: "제4조 (서비스의 제공 및 변경)" },
  { id: "suspension", title: "제5조 (서비스의 중단)" },
  { id: "membership", title: "제6조 (회원가입)" },
  { id: "privacy", title: "제7조 (개인정보보호)" },
  { id: "obligations", title: "제8조 (이용자의 의무)" },
  { id: "copyright", title: "제9조 (저작권의 귀속 및 이용제한)" },
  { id: "disclaimer", title: "제10조 (면책조항)" },
  { id: "ads", title: "제11조 (광고의 게재)" },
  { id: "addendum", title: "부칙" },
] as const;

function Section({
  index,
  id,
  title,
  children,
}: {
  index: number;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#155DFC]">
          {index}
        </span>
        <h2 className="text-base font-semibold text-[#101828] sm:text-[17px]">
          {title}
        </h2>
      </div>
      <div className="mt-3 space-y-3 pl-[34px] text-sm leading-7 text-[#374151]">
        {children}
      </div>
    </section>
  );
}

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="text-sm text-[#6B7280] transition-colors hover:text-[#374151]"
        >
          ← 홈으로
        </Link>

        <div className="mt-4 mb-8">
          <h1 className="text-2xl font-bold text-[#101828] sm:text-3xl">
            이용약관
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">시행일 2026년 1월 1일</p>
        </div>

        <div>
          <div className="flex flex-col gap-8">
            <Section index={1} id="purpose" title={SECTIONS[0].title}>
              <p>
                본 약관은 큐노(QKNOU)가 제공하는 방송통신대학교 기출문제
                서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및
                책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </Section>

            <Section index={2} id="definitions" title={SECTIONS[1].title}>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  &quot;서비스&quot;란 회사가 제공하는 방송통신대학교
                  기출문제 풀이 및 학습 관련 서비스를 의미합니다.
                </li>
                <li>
                  &quot;이용자&quot;란 본 약관에 따라 회사가 제공하는
                  서비스를 받는 회원 및 비회원을 의미합니다.
                </li>
                <li>
                  &quot;회원&quot;이란 회사에 개인정보를 제공하여
                  회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며,
                  회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를
                  의미합니다.
                </li>
              </ul>
            </Section>

            <Section index={3} id="notice" title={SECTIONS[2].title}>
              <p>
                회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스
                초기 화면에 게시합니다. 회사는 필요한 경우 관련 법령을
                위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
              </p>
            </Section>

            <Section index={4} id="provision" title={SECTIONS[3].title}>
              <p>회사는 다음과 같은 서비스를 제공합니다:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>방송통신대학교 기출문제 제공</li>
                <li>문제 풀이 및 학습 기능</li>
                <li>
                  기타 회사가 추가 개발하거나 제휴계약 등을 통해 이용자에게
                  제공하는 일체의 서비스
                </li>
              </ul>
            </Section>

            <Section index={5} id="suspension" title={SECTIONS[4].title}>
              <p>
                회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장,
                통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을
                일시적으로 중단할 수 있습니다.
              </p>
            </Section>

            <Section index={6} id="membership" title={SECTIONS[5].title}>
              <p>
                이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후
                본 약관에 동의한다는 의사표시를 함으로서 회원가입을
                신청합니다.
              </p>
            </Section>

            <Section index={7} id="privacy" title={SECTIONS[6].title}>
              <p>
                회사는 이용자의 개인정보 수집 및 이용 목적에 따라 필요한
                최소한의 개인정보를 수집합니다. 자세한 내용은{" "}
                <Link href="/privacy" className="text-[#155DFC] hover:underline">
                  개인정보처리방침
                </Link>
                을 참고하시기 바랍니다.
              </p>
            </Section>

            <Section index={8} id="obligations" title={SECTIONS[7].title}>
              <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보 등의 송신 또는 게시</li>
                <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              </ul>
            </Section>

            <Section index={9} id="copyright" title={SECTIONS[8].title}>
              <p>
                회사가 작성한 저작물에 대한 저작권 기타 지적재산권은
                회사에 귀속합니다. 이용자는 회사를 이용함으로써 얻은
                정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송
                기타 방법에 의하여 영리목적으로 이용하거나 제3자에게
                이용하게 하여서는 안 됩니다.
              </p>
            </Section>

            <Section index={10} id="disclaimer" title={SECTIONS[9].title}>
              <p>
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여
                서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이
                면제됩니다.
              </p>
              <p>
                회사는 무료로 제공되는 서비스 이용과 관련하여 관련법에
                특별한 규정이 없는 한 책임을 지지 않습니다.
              </p>
              <p>
                회사는 서비스에 게재된 기출문제, 정보, 자료의 정확성 및
                신뢰도를 보증하지 않으며, 이용자가 이를 신뢰함에 따라 입은
                손해에 대해 책임을 지지 않습니다.
              </p>
            </Section>

            <Section index={11} id="ads" title={SECTIONS[10].title}>
              <p>
                회사는 서비스 운영과 관련하여 서비스 화면, 홈페이지 등에
                광고를 게재할 수 있습니다.
              </p>
            </Section>

            <Section index={12} id="addendum" title={SECTIONS[11].title}>
              <p>본 약관은 2026년 1월 1일부터 시행됩니다.</p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
