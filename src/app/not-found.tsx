import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-6">
        {/* 404 숫자 */}
        <h1 className="text-8xl font-bold text-[#3B82F6] md:text-9xl">404</h1>

        {/* 메시지 */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-[#101828] md:text-2xl">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="max-w-md text-sm text-[#6B7280] md:text-base">
            요청하신 페이지가 존재하지 않거나, 이동되었거나, 삭제되었을 수
            있습니다.
          </p>
        </div>

        {/* 홈으로 돌아가기 버튼 */}
        <Link
          href="/"
          className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-black px-8 text-sm font-medium text-white transition-colors hover:bg-[#1F2937] md:text-base"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
