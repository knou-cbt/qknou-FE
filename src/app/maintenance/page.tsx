export default function MaintenancePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EFF6FF]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-[#101828] md:text-2xl">
            서비스 준비 중입니다
          </h2>
          <p className="max-w-md text-sm text-[#6B7280] md:text-base">
            더 나은 서비스를 제공하기 위해 점검 중입니다.
            <br />
            잠시 후 다시 이용해 주세요.
          </p>
        </div>
      </div>
    </main>
  );
}
