const ADSENSE_CLIENT_ID = "ca-pub-7674232492620300";

/**
 * 구글 애드센스 스크립트. 애드센스는 게시자 콘텐츠가 없는 화면(로그인·로그인 완료·점검·404·
 * 로딩만 있는 마이페이지 등)에 광고를 금지하므로, 루트 레이아웃이 아니라 기출문제·과목 목록처럼
 * 서버에서 본문이 그려지는 페이지에서만 이 컴포넌트를 렌더한다.
 * React 19가 async 스크립트를 <head>로 올리고 src 기준으로 중복을 제거하므로 여러 번 렌더돼도 한 번만 로드된다.
 */
export function AdSenseScript() {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
