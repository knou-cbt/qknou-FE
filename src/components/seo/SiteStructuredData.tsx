/**
 * GEO / SEO: 사이트 전역 JSON-LD (WebSite, Organization)
 * AI·검색엔진이 사이트 주제·권위를 이해하는 데 활용됩니다.
 */
import { SITE_URL } from "@/constants";

const SITE_NAME = "큐노";
const SITE_DESC =
  "큐노(QKNOU)는 방송통신대학교(KNOU) 기출문제를 한곳에서 제공하는 문제 풀이 플랫폼입니다. 과목/연도별 문제 풀이와 학습을 지원합니다.";

export function SiteStructuredData() {
  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: "QKNOU",
    url: SITE_URL,
    description: SITE_DESC,
    inLanguage: "ko",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESC,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSite),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization),
        }}
      />
    </>
  );
}
