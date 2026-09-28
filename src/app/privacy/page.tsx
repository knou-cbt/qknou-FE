"use client";

import React from "react";
import Link from "next/link";

const SECTIONS = [
  { id: "purpose", title: "제1조 (개인정보의 처리 목적)" },
  { id: "period", title: "제2조 (개인정보의 처리 및 보유기간)" },
  { id: "items", title: "제3조 (처리하는 개인정보의 항목)" },
  { id: "third-party", title: "제4조 (개인정보의 제3자 제공)" },
  { id: "outsourcing", title: "제5조 (개인정보처리의 위탁)" },
  { id: "rights", title: "제6조 (정보주체의 권리·의무 및 그 행사방법)" },
  { id: "destruction", title: "제7조 (개인정보의 파기)" },
  { id: "officer", title: "제8조 (개인정보 보호책임자)" },
  { id: "safety", title: "제9조 (개인정보의 안전성 확보조치)" },
  { id: "changes", title: "제10조 (개인정보 처리방침 변경)" },
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

const PrivacyPage = () => {
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
            개인정보처리방침
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">시행일 2026년 1월 1일</p>
        </div>

        <div>
          <div className="flex flex-col gap-8">
            <Section index={1} id="purpose" title={SECTIONS[0].title}>
              <p>
                큐노(QKNOU)는 다음의 목적을 위하여 개인정보를 처리합니다.
                처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지
                않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법
                제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할
                예정입니다.
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스
                  제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스
                  부정이용 방지 목적
                </li>
                <li>서비스 제공: 기출문제 제공, 문제 풀이 서비스, 학습 기능 제공</li>
                <li>서비스 개선: 신규 서비스 개발, 맞춤 서비스 제공, 서비스 품질 향상</li>
              </ul>
            </Section>

            <Section index={2} id="period" title={SECTIONS[1].title}>
              <p>
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터
                개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
                개인정보를 처리·보유합니다.
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령 위반에
                  따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료
                  시까지)
                </li>
                <li>서비스 이용 기록: 3년 (통신비밀보호법)</li>
              </ul>
            </Section>

            <Section index={3} id="items" title={SECTIONS[2].title}>
              <p>회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  필수항목: 이메일, 이름, 소셜 로그인 제공자가 부여한 고유
                  식별번호(소셜 로그인 제공자로부터 수집)
                </li>
                <li>자동 수집 항목: IP주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
              </ul>
            </Section>

            <Section index={4} id="third-party" title={SECTIONS[3].title}>
              <p>
                회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서
                명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한
                규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만
                개인정보를 제3자에게 제공합니다.
              </p>
            </Section>

            <Section index={5} id="outsourcing" title={SECTIONS[4].title}>
              <p>
                회사는 원활한 개인정보 업무처리를 위하여 다음과 같이
                개인정보 처리업무를 위탁하고 있습니다:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>클라우드 서비스 제공: 서버 운영 및 데이터 저장 (AWS, Vercel 등)</li>
                <li>소셜 로그인 서비스: 구글, 카카오 (인증 서비스 제공)</li>
              </ul>
            </Section>

            <Section index={6} id="rights" title={SECTIONS[5].title}>
              <p>
                정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호
                관련 권리를 행사할 수 있습니다:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>개인정보 열람요구권</li>
                <li>개인정보 정정·삭제요구권</li>
                <li>개인정보 처리정지 요구권</li>
              </ul>
              <p>
                정보주체는 언제든지 이메일(hansuyeon.dev@gmail.com)을 통해
                개인정보 열람·정정·삭제·처리정지 요구를 할 수 있으며, 회사는
                이에 대해 지체 없이 조치하겠습니다.
              </p>
            </Section>

            <Section index={7} id="destruction" title={SECTIONS[6].title}>
              <p>
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등
                개인정보가 불필요하게 되었을 때에는 지체없이 해당
                개인정보를 파기합니다.
              </p>
              <p>파기의 절차 및 방법은 다음과 같습니다:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  파기절차: 회사는 파기 사유가 발생한 개인정보를 선정하고,
                  회사의 개인정보 보호책임자의 승인을 받아 개인정보를
                  파기합니다.
                </li>
                <li>
                  파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는
                  기술적 방법을 사용합니다.
                </li>
              </ul>
            </Section>

            <Section index={8} id="officer" title={SECTIONS[7].title}>
              <p>
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고,
                개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을
                위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="rounded-lg bg-[#F9FAFB] px-4 py-3">
                <p className="font-medium text-[#101828]">개인정보 보호책임자</p>
                <p className="mt-1 text-[#6B7280]">이메일: hansuyeon.dev@gmail.com</p>
              </div>
            </Section>

            <Section index={9} id="safety" title={SECTIONS[8].title}>
              <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
                <li>
                  기술적 조치: 개인정보처리시스템 등의 접근권한 관리,
                  접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램
                  설치
                </li>
                <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </Section>

            <Section index={10} id="changes" title={SECTIONS[9].title}>
              <p>
                이 개인정보처리방침은 2026년 1월 1일부터 적용되며, 법령 및
                방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
                변경사항의 시행 7일 전부터 공지사항을 통하여 고지할
                것입니다.
              </p>
            </Section>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPage;
