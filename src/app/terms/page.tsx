"use client";

import React from "react";
import Link from "next/link";

const TermsPage = () => {
  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-b from-[#F9FAFB] to-[#EFF6FF] px-4 pt-20 pb-20">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">이용약관</h1>
          
          <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제1조 (목적)</h2>
              <p>
                본 약관은 큐노(QKNOU)가 제공하는 방송통신대학교 기출문제 서비스의 이용과 관련하여 
                회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제2조 (정의)</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>&quot;서비스&quot;란 회사가 제공하는 방송통신대학교 기출문제 풀이 및 학습 관련 서비스를 의미합니다.</li>
                <li>&quot;이용자&quot;란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.</li>
                <li>&quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제3조 (약관의 게시와 개정)</h2>
              <p>
                회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 
                회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제4조 (서비스의 제공 및 변경)</h2>
              <p>
                회사는 다음과 같은 서비스를 제공합니다:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>방송통신대학교 기출문제 제공</li>
                <li>문제 풀이 및 학습 기능</li>
                <li>기타 회사가 추가 개발하거나 제휴계약 등을 통해 이용자에게 제공하는 일체의 서비스</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제5조 (서비스의 중단)</h2>
              <p>
                회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 
                서비스의 제공을 일시적으로 중단할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제6조 (회원가입)</h2>
              <p>
                이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제7조 (개인정보보호)</h2>
              <p>
                회사는 이용자의 개인정보 수집 및 이용 목적에 따라 필요한 최소한의 개인정보를 수집합니다. 
                자세한 내용은 개인정보처리방침을 참고하시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제8조 (이용자의 의무)</h2>
              <p>이용자는 다음 행위를 하여서는 안 됩니다:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보 등의 송신 또는 게시</li>
                <li>회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제9조 (저작권의 귀속 및 이용제한)</h2>
              <p>
                회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다. 
                이용자는 회사를 이용함으로써 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제10조 (면책조항)</h2>
              <p>
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </p>
              <p>
                회사는 무료로 제공되는 서비스 이용과 관련하여 관련법에 특별한 규정이 없는 한 책임을 지지 않습니다.
              </p>
              <p>
                회사는 서비스에 게재된 기출문제, 정보, 자료의 정확성 및 신뢰도를 보증하지 않으며, 이용자가 이를 신뢰함에 따라 입은 손해에 대해 책임을 지지 않습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">제11조 (광고의 게재)</h2>
              <p>
                회사는 서비스 운영과 관련하여 서비스 화면, 홈페이지 등에 광고를 게재할 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">부칙</h2>
              <p>본 약관은 2026년 1월 1일부터 시행됩니다.</p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              href="/auth/login" 
              className="text-[#155DFC] hover:underline text-sm"
            >
              ← 로그인 페이지로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

