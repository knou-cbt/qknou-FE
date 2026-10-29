/** 로그인 성공 배지: 브랜드 블루 원형 배지 위에 체크가 그려지고, 바깥 링이 퍼져나간다 */
export const LoginSuccessIcon = ({ className }: { className?: string }) => {
  return (
    <div className={`relative ${className ?? ""}`}>
      <span
        aria-hidden
        className="animate-login-success-ring absolute inset-0 rounded-full bg-[#155DFC]/30"
      />
      <svg
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-login-success-pop relative h-full w-full drop-shadow-[0_8px_16px_rgba(21,93,252,0.35)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="login-success-bg" x1="12" y1="8" x2="84" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F8BFF" />
            <stop offset="1" stopColor="#155DFC" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r="44" fill="url(#login-success-bg)" />
        {/* 상단 하이라이트로 입체감 */}
        <path
          d="M18 38C22 22 34 12 48 12C58 12 67 16 73 23"
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M31 49L43 61L66 37"
          stroke="white"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-login-success-draw"
        />
      </svg>
    </div>
  );
};
